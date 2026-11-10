import io
import os
import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple, Optional, List
from api.schemas.models import ValidationReport, DataProvenance

DEFAULT_CSV_PATH = os.path.join(os.path.dirname(__file__), "agmarknet_sample.csv")

# Standard column aliases for user-uploaded CSV mapping
COLUMN_ALIASES = {
    "date": ["date", "observation_date", "arrival_date", "reported_date", "dt"],
    "state": ["state", "state_name", "province", "st"],
    "district": ["district", "district_name", "dist"],
    "market": ["market", "market_name", "mandi", "mandi_name", "market_center"],
    "commodity": ["commodity", "crop", "commodity_name", "item"],
    "variety": ["variety", "crop_variety", "grade"],
    "min_price": ["min_price", "minimum_price", "min", "minimum"],
    "max_price": ["max_price", "maximum_price", "max", "maximum"],
    "modal_price": ["modal_price", "modal", "price", "modal_price_rs_qtl", "avg_price"],
    "arrivals": ["arrivals_tonnes", "arrivals", "arrival_quantity", "volume", "arrival_tonnes", "arrivals_qtl"]
}

def get_default_dataset() -> pd.DataFrame:
    """Loads the pre-packaged authentic AGMARKNET sample dataset."""
    if os.path.exists(DEFAULT_CSV_PATH):
        df = pd.read_csv(DEFAULT_CSV_PATH)
        df["Date"] = pd.to_datetime(df["Date"]).dt.strftime("%Y-%m-%d")
        return df
    raise FileNotFoundError(f"Default dataset not found at {DEFAULT_CSV_PATH}")

def detect_column_mapping(columns: List[str]) -> Dict[str, str]:
    """Detects mapping between user uploaded headers and standard schema."""
    mapping = {}
    normalized_cols = {col.strip().lower().replace(" ", "_"): col for col in columns}
    
    for standard_name, aliases in COLUMN_ALIASES.items():
        matched = None
        for alias in aliases:
            if alias in normalized_cols:
                matched = normalized_cols[alias]
                break
        if matched:
            mapping[standard_name] = matched
    return mapping

def validate_and_clean_data(
    file_content: Optional[str] = None,
    custom_mapping: Optional[Dict[str, str]] = None
) -> Tuple[pd.DataFrame, ValidationReport]:
    """
    Validates and cleans uploaded CSV data or default dataset.
    Returns cleaned pandas DataFrame and a detailed ValidationReport.
    """
    applied_transformations = []
    
    if file_content is not None:
        try:
            df_raw = pd.read_csv(io.StringIO(file_content))
        except Exception as e:
            return pd.DataFrame(), ValidationReport(
                total_rows=0,
                valid_rows=0,
                rejected_rows=0,
                duplicate_rows=0,
                missing_value_counts={},
                column_mapping={},
                applied_transformations=["Failed to parse CSV file content."],
                sample_records=[],
                is_valid=False,
                error_message=f"CSV Parsing Error: {str(e)}"
            )
    else:
        df_raw = get_default_dataset()
        applied_transformations.append("Loaded verified default AGMARKNET sample dataset.")

    total_rows = len(df_raw)
    col_mapping = custom_mapping or detect_column_mapping(list(df_raw.columns))
    
    required_fields = ["date", "state", "district", "market", "commodity", "modal_price"]
    missing_required = [req for req in required_fields if req not in col_mapping]
    
    if missing_required:
        return pd.DataFrame(), ValidationReport(
            total_rows=total_rows,
            valid_rows=0,
            rejected_rows=total_rows,
            duplicate_rows=0,
            missing_value_counts={},
            column_mapping=col_mapping,
            applied_transformations=[f"Validation failed: missing required column(s): {', '.join(missing_required)}"],
            sample_records=[],
            is_valid=False,
            error_message=f"Missing required columns: {', '.join(missing_required)}. Please map them correctly."
        )

    # Standardize column names
    rename_dict = {col_mapping[k]: k.capitalize() for k in col_mapping if k in col_mapping}
    # Special naming for modal price and arrivals
    if "modal_price" in col_mapping:
        rename_dict[col_mapping["modal_price"]] = "Modal_Price"
    if "min_price" in col_mapping:
        rename_dict[col_mapping["min_price"]] = "Min_Price"
    if "max_price" in col_mapping:
        rename_dict[col_mapping["max_price"]] = "Max_Price"
    if "arrivals" in col_mapping:
        rename_dict[col_mapping["arrivals"]] = "Arrivals_Tonnes"
        
    df = df_raw.rename(columns=rename_dict).copy()
    applied_transformations.append(f"Mapped {len(rename_dict)} columns to standard schema.")

    # Check duplicates
    key_cols = [c for c in ["Date", "Market", "Commodity", "Variety"] if c in df.columns]
    duplicate_count = int(df.duplicated(subset=key_cols).sum())
    if duplicate_count > 0:
        df = df.drop_duplicates(subset=key_cols, keep="first")
        applied_transformations.append(f"Removed {duplicate_count} duplicate observations.")

    # Validate Dates
    initial_valid_dates = pd.to_datetime(df["Date"], errors="coerce")
    invalid_dates_count = int(initial_valid_dates.isna().sum())
    if invalid_dates_count > 0:
        applied_transformations.append(f"Dropped {invalid_dates_count} records with invalid date format.")
        df = df[initial_valid_dates.notna()].copy()
        df["Date"] = initial_valid_dates[initial_valid_dates.notna()].dt.strftime("%Y-%m-%d")
    else:
        df["Date"] = initial_valid_dates.dt.strftime("%Y-%m-%d")

    # Validate Modal Price
    df["Modal_Price"] = pd.to_numeric(df["Modal_Price"], errors="coerce")
    invalid_prices = (df["Modal_Price"].isna()) | (df["Modal_Price"] <= 0)
    invalid_prices_count = int(invalid_prices.sum())
    if invalid_prices_count > 0:
        applied_transformations.append(f"Dropped {invalid_prices_count} records with non-positive or missing modal price.")
        df = df[~invalid_prices].copy()

    # Min and Max Price handling
    if "Min_Price" in df.columns:
        df["Min_Price"] = pd.to_numeric(df["Min_Price"], errors="coerce").fillna(df["Modal_Price"] * 0.95)
    else:
        df["Min_Price"] = df["Modal_Price"] * 0.95

    if "Max_Price" in df.columns:
        df["Max_Price"] = pd.to_numeric(df["Max_Price"], errors="coerce").fillna(df["Modal_Price"] * 1.05)
    else:
        df["Max_Price"] = df["Modal_Price"] * 1.05

    # Arrivals handling
    if "Arrivals_Tonnes" in df.columns:
        df["Arrivals_Tonnes"] = pd.to_numeric(df["Arrivals_Tonnes"], errors="coerce").fillna(0.0)
    else:
        df["Arrivals_Tonnes"] = 0.0

    if "Variety" not in df.columns:
        df["Variety"] = "Standard / Common"

    if "Unit" not in df.columns:
        df["Unit"] = "INR / Quintal"

    if "Data_Source" not in df.columns:
        df["Data_Source"] = "User Uploaded Dataset" if file_content else "AGMARKNET / OGD India"

    # String stripping & normalization
    for str_col in ["State", "District", "Market", "Commodity", "Variety"]:
        if str_col in df.columns:
            df[str_col] = df[str_col].astype(str).str.strip().str.title()

    valid_rows = len(df)
    rejected_rows = total_rows - valid_rows - duplicate_count

    missing_counts = {str(k): int(v) for k, v in df_raw.isna().sum().to_dict().items()}

    # Sample preview records
    sample_preview = df.head(10).to_dict(orient="records")

    report = ValidationReport(
        total_rows=total_rows,
        valid_rows=valid_rows,
        rejected_rows=max(0, rejected_rows),
        duplicate_rows=duplicate_count,
        missing_value_counts=missing_counts,
        column_mapping=col_mapping,
        applied_transformations=applied_transformations,
        sample_records=sample_preview,
        is_valid=valid_rows > 0,
        error_message=None if valid_rows > 0 else "No valid records remained after validation."
    )

    return df, report
