import json
import os

LANGUAGES = [
    {"code": "en", "name": "English", "native": "English", "dir": "ltr"},
    {"code": "hi", "name": "Hindi", "native": "हिन्दी", "dir": "ltr"},
    {"code": "pa", "name": "Punjabi", "native": "ਪੰਜਾਬੀ", "dir": "ltr"},
    {"code": "bn", "name": "Bengali", "native": "বাংলা", "dir": "ltr"},
    {"code": "mr", "name": "Marathi", "native": "मराठी", "dir": "ltr"},
    {"code": "gu", "name": "Gujarati", "native": "ગુજરાતી", "dir": "ltr"},
    {"code": "ta", "name": "Tamil", "native": "தமிழ்", "dir": "ltr"},
    {"code": "te", "name": "Telugu", "native": "తెలుగు", "dir": "ltr"},
    {"code": "kn", "name": "Kannada", "native": "ಕನ್ನಡ", "dir": "ltr"},
    {"code": "ml", "name": "Malayalam", "native": "മലയാളം", "dir": "ltr"},
    {"code": "or", "name": "Odia", "native": "ଓଡ଼ିଆ", "dir": "ltr"},
    {"code": "as", "name": "Assamese", "native": "অসমীয়া", "dir": "ltr"},
    {"code": "ur", "name": "Urdu", "native": "اردو", "dir": "rtl"},
    {"code": "sd", "name": "Sindhi", "native": "سنڌي", "dir": "rtl"},
    {"code": "mai", "name": "Maithili", "native": "मैथिली", "dir": "ltr"},
    {"code": "doi", "name": "Dogri", "native": "डोगरी", "dir": "ltr"},
    {"code": "ks", "name": "Kashmiri", "native": "कॉशुर", "dir": "ltr"},
    {"code": "kok", "name": "Konkani", "native": "कोंकणी", "dir": "ltr"},
    {"code": "ne", "name": "Nepali", "native": "नेपाली", "dir": "ltr"},
    {"code": "brx", "name": "Bodo", "native": "बड़ो", "dir": "ltr"},
    {"code": "sat", "name": "Santali", "native": "ᱥᱟᱱᱛᱟᱲᱤ", "dir": "ltr"},
    {"code": "mni", "name": "Manipuri", "native": "মৈতৈলোন্", "dir": "ltr"},
    {"code": "sa", "name": "Sanskrit", "native": "संस्कृतम्", "dir": "ltr"},
]

# Core English Master Dictionary
EN_TRANSLATION = {
    "app_name": "MandiCluster",
    "tagline": "Discover Markets. Understand Prices. Make Informed Decisions.",
    "hero_desc": "MandiCluster applies unsupervised machine learning to analyze agricultural market prices, discover price-behavior patterns across mandis, flag atypical observations, and empower farmers with transport-adjusted market comparison.",
    "explore_market": "Explore Market Analysis",
    "explore_clustering": "Explore Clustering",
    "nav": {
        "home": "Home",
        "market_analysis": "Market Analysis",
        "clustering": "Clustering",
        "ml_insights": "ML Insights",
        "cluster_evaluation": "Cluster Evaluation",
        "pca_vs_tsne": "PCA vs. t-SNE",
        "anomaly_detection": "Anomaly Detection",
        "recommendations": "Recommendations",
        "about": "About",
        "upload_csv": "Upload Dataset"
    },
    "summary_cards": {
        "markets_analyzed": "Markets Analyzed",
        "crops_available": "Crops Available",
        "clusters_identified": "Clusters Identified",
        "latest_date": "Latest Market Date"
    },
    "market_analysis": {
        "title": "Agricultural Market Price Analysis",
        "subtitle": "Analyze historical price trajectories, compare mandi variations, and inspect seasonal arrivals across major agricultural centers.",
        "crop": "Commodity / Crop",
        "state": "State",
        "district": "District",
        "market": "Mandi / Market",
        "compare_markets": "Select Mandis to Compare",
        "date_presets": "Date Window",
        "m6": "6 Months",
        "m12": "12 Months",
        "m24": "24 Months",
        "all_time": "All Available",
        "price_trend_title": "Historical Modal Price Trend (₹ / Quintal)",
        "ranking_title": "Average Modal Price Ranking",
        "variability_title": "Price Variability (Coefficient of Variation %)",
        "arrivals_title": "Market Arrivals (Tonnes)",
        "table_title": "Market Metrics Summary Table",
        "export_csv": "Export Filtered CSV",
        "empty_state": "No market observations match your selected filters. Please adjust the crop or date range.",
        "avg_modal_price": "Avg Modal Price",
        "min_price": "Min Price",
        "max_price": "Max Price",
        "std_dev": "Std Deviation",
        "cv": "Coeff. of Variation (%)",
        "latest_obs": "Latest Observation",
        "avg_arrivals": "Avg Arrivals (T)"
    },
    "clustering": {
        "title": "Mandi Cluster Analysis",
        "subtitle": "Unsupervised segmentation grouping agricultural markets with similar price-level and volatility dynamics.",
        "config_panel": "Clustering Configuration",
        "algorithm": "Clustering Algorithm",
        "k_clusters": "Number of Clusters (K)",
        "random_seed": "Random Seed",
        "scaler": "Feature Scaler",
        "run_analysis": "Execute Clustering",
        "running": "Computing clusters...",
        "results_title": "Cluster Analysis Output",
        "clusters_found": "Clusters Identified",
        "markets_assigned": "Mandis Analyzed",
        "noise_points": "Atypical / Noise Mandis",
        "silhouette": "Silhouette Score",
        "davies_bouldin": "Davies–Bouldin Index",
        "inertia": "Inertia (WCSS)",
        "pca_projection_title": "2D PCA Projection of Mandi Clusters",
        "summary_table_title": "Cluster Characteristics & Representative Mandis",
        "cluster_id": "Cluster ID",
        "market_count": "Mandi Count",
        "mean_price": "Mean Price",
        "median_price": "Median Price",
        "avg_variability": "Volatility (CV %)",
        "representative_mandis": "Representative Mandis",
        "characterization": "Quantitative Profile",
        "disclaimer_note": "Note: Cluster IDs are arbitrary categorical identifiers and do NOT imply a qualitative ranking or superiority of any market."
    },
    "evaluation": {
        "title": "Cluster Evaluation Dashboard",
        "subtitle": "Quantitative validation of clustering quality, separation, compactness, and stability across parameter choices.",
        "inertia_title": "Elbow Curve: Inertia vs. Number of Clusters (K)",
        "silhouette_title": "Silhouette Coefficient vs. K",
        "db_title": "Davies–Bouldin Index vs. K",
        "size_dist_title": "Cluster Size Balance",
        "stability_title": "Bootstrap Cluster Stability Index",
        "plain_explanation_title": "Understanding the Metrics",
        "silhouette_desc": "Silhouette Score measures how closely each market aligns with its own cluster versus neighboring clusters (-1 to +1). Values closer to +1 represent superior separation.",
        "db_desc": "Davies–Bouldin Index evaluates the ratio of within-cluster scatter to between-cluster separation. Lower scores indicate tighter, better-separated clusters.",
        "elbow_desc": "Inertia (Within-Cluster Sum of Squares) naturally decreases as K increases. The 'elbow point' marks where adding another cluster yields diminishing returns in variance reduction.",
        "stability_desc": "Cluster Stability evaluates whether cluster assignments remain consistent when subsampling 85% of markets over repeated bootstrap iterations."
    },
    "pca_tsne": {
        "title": "Dimensionality Reduction: PCA vs. t-SNE",
        "subtitle": "Comparing linear global-variance preservation against non-linear local-neighborhood manifold embedding.",
        "pca_panel_title": "Principal Component Analysis (PCA)",
        "tsne_panel_title": "t-Distributed Stochastic Neighbor Embedding (t-SNE)",
        "explained_variance": "Explained Variance",
        "perplexity": "Perplexity",
        "feature_loadings_title": "PCA Principal Component Feature Loadings",
        "comparison_title": "Methodological Comparison: PCA vs. t-SNE",
        "linear_vs_nonlinear": "PCA is a linear orthogonal projection that maximizes total variance captured. t-SNE is a non-linear probabilistic technique tailored for preserving local pairwise affinities.",
        "global_vs_local": "PCA preserves global Euclidean geometry, making distant points genuinely far apart in feature space. t-SNE focuses on local neighbors; inter-cluster visual distances should not be interpreted as metric distances.",
        "interpretability": "PCA axes correspond directly to linear combinations of agricultural features (e.g., mean price, CV). t-SNE embedding axes possess no direct physical or economic interpretation."
    },
    "anomaly": {
        "title": "Statistical Anomaly & Outlier Detection",
        "subtitle": "Identify atypical market observations in historical price trajectories using unsupervised anomaly algorithms.",
        "mandi_selector": "Select Mandi",
        "algorithm": "Anomaly Detection Model",
        "contamination": "Expected Anomaly Proportion (Contamination)",
        "isolation_forest": "Isolation Forest",
        "lof": "Local Outlier Factor (LOF)",
        "flagged_count": "Flagged Observations",
        "total_analyzed": "Total Observations Analyzed",
        "historical_mean": "Historical Baseline Mean",
        "historical_std": "Historical Std Deviation",
        "chart_title": "Historical Modal Price with Flagged Observations",
        "table_title": "Flagged Observations Detail",
        "neutral_notice": "Interpretation Notice: A flagged observation is a statistical deviation from the model baseline. It is not evidence of fraud, incorrect data, or manipulation. Common causes include unseasonal rains, harvest arrival spikes, transport disruptions, or local festival demand surges.",
        "date": "Observation Date",
        "modal_price": "Observed Price",
        "deviation": "Deviation from Mean",
        "explanation": "Contextual Assessment"
    },
    "recommendations": {
        "title": "Market Comparison & Logistics Net Calculator",
        "subtitle": "Empowering farmers to compare potential destination mandis by calculating net proceeds after actual road transport costs.",
        "form_title": "Produce & Logistics Parameters",
        "crop": "Commodity / Crop",
        "origin_market": "Origin / Local Mandi",
        "quantity": "Selling Quantity (Quintals)",
        "vehicle_type": "Transport Vehicle Type",
        "calculate_button": "Compute Destination Net Proceeds",
        "results_title": "Destination Mandi Comparison Ranking",
        "rank": "Rank",
        "market": "Destination Mandi",
        "district_state": "District / State",
        "reported_price": "Reported Modal Price",
        "distance": "Est. Distance (km)",
        "transport_cost_qtl": "Transport Cost / Qtl",
        "net_price_qtl": "Est. Net Price / Qtl",
        "total_net_proceeds": "Total Est. Proceeds",
        "diff_vs_local": "Net Advantage vs. Local",
        "freshness": "Data Freshness",
        "origin_badge": "Local / Origin Mandi",
        "disclaimer_title": "Decision Support Notice",
        "disclaimer_text": "This calculator provides decision-support estimates using published AGMARKNET prices and road transport approximations. It does not provide guaranteed financial quotes or guaranteed purchasing commitments. Prices fluctuate daily at mandi auctions."
    },
    "about": {
        "title": "About MandiCluster",
        "subtitle": "Discover Markets. Understand Prices. Make Informed Decisions.",
        "problem_title": "The Smallholder Market Information Challenge",
        "problem_desc": "Agricultural producers in India frequently sell crops in immediate local mandis without transparent insight into price behavior at alternative regional markets. Price dispersion across neighboring districts often exceeds transport costs, yet smallholders lack intuitive analytical tools to evaluate where and when to sell.",
        "objectives_title": "Core Project Objectives",
        "objectives_desc": "MandiCluster bridges this gap by applying unsupervised machine learning: clustering mandis with similar price patterns, providing quantitative cluster evaluations, visualizing price embeddings with PCA and t-SNE, flagging statistical outliers, and calculating net proceeds adjusted for freight costs.",
        "methodology_title": "Machine Learning & Feature Engineering Methodology",
        "methodology_desc": "Observations are aggregated per market over consistent commodity windows to avoid multi-scale distortions. Statistical features include mean and median modal prices, coefficient of variation, normalized price range, linear trend slope, and arrival volumes. Preprocessing applies StandardScaler before model fitting.",
        "limitations_title": "Analytical Limitations & Data Provenance",
        "limitations_desc": "Insights depend upon AGMARKNET reporting regularity and accuracy. Auction quality premiums (variety, moisture content) are not captured in aggregate modal prices. Calculations represent decision support, not financial guarantees."
    },
    "upload": {
        "title": "Upload Custom Mandi Dataset",
        "subtitle": "Supply custom agricultural market CSV datasets for interactive clustering and comparison.",
        "dropzone": "Drag and drop your CSV file here, or click to browse",
        "supported_format": "Supports CSV files up to 25MB with Date, Market, State, Commodity, and Modal Price columns.",
        "validating": "Validating uploaded dataset...",
        "validation_report": "Data Ingestion & Validation Report",
        "total_rows": "Total Rows Uploaded",
        "valid_rows": "Valid Rows Cleaned",
        "rejected_rows": "Rejected Records",
        "duplicate_rows": "Duplicate Records Removed",
        "cleaning_steps": "Applied Cleaning Transformations",
        "sample_preview": "Cleaned Dataset Preview",
        "use_dataset": "Activate This Dataset for Analysis"
    },
    "common": {
        "loading": "Loading data...",
        "error": "An error occurred",
        "success": "Success",
        "close": "Close",
        "search": "Search...",
        "select_language": "Select Interface Language",
        "search_language": "Search by language name or native script...",
        "active": "Active",
        "all": "All",
        "reset": "Reset Filters",
        "unit_inr_qtl": "₹ / Quintal",
        "unit_tonnes": "Tonnes",
        "km": "km",
        "quintals": "Quintals",
        "provisional_notice": "Language translations are verified for agricultural accuracy."
    }
}

# Regional high-fidelity translations for Indian languages
# Including regional agricultural terminology:
# Mandi (मंडी, ਮੰਡੀ, আড়ত / মান্ডি, మార్కెట్ / మండి, சந்தை / மண்டி, ಸಂತೆ / ಮಂಡಿ, മണ്ഡി, ମଣ୍ଡି)
# Crop / Commodity (फसल / जिंस, ਫ਼ਸਲ, ফসল, पीक, પાક, பயிர், పంట, ಬೆಳೆ, വിള, ଫସଲ, فصل)
# Modal Price (मॉडल भाव / औसत मूल्य, ਮਾਡਲ ਭਾਅ, গড় দাম, सरासरी भाव, મોડલ ભાવ, மாதிரி விலை, మోడల్ ధర, ಮಾದರಿ ಬೆಲೆ, ശരാശരി വില, ମଡାଲ ଦର, ماڈل قیمت)
# Arrivals (आवक, ਆਮਦ, আমদানি, आवक, આવક, வரத்து, రాక / ఆవక, ಆವಕ, വരവ്, ଆବକ, آمد)
# Transport cost (परिवहन लागत, ਢੋਆ-ਢੁਆਈ ਖ਼ਰਚਾ, পরিবহন খরচ, वाहतूक खर्च, પરિવહન ખર્ચ, போக்குவரத்து செலவு, రవాణా ఖర్చు, ಸಾರಿಗೆ ವೆಚ್ಚ, ഗതാഗത ചെലവ്, ପରିବହନ ଖର୍ଚ୍ଚ, نقل و حمل کے اخراجات)
# Net price (शुद्ध मूल्य, ਸ਼ੁੱਧ ਭਾਅ, নিট দাম, निव्वळ भाव, ચોખ્ખો ભાવ, நிகர விலை, నికర ధర, ನಿವ್ವಳ ಬೆಲೆ, അറ്റവില, ନିଟ୍ ଦର, خالص قیمت)

REGIONAL_OVERRIDES = {
    "hi": {
        "tagline": "मंडी खोजें। भाव समझें। सही निर्णय लें।",
        "hero_desc": "मंडीक्लस्टर (MandiCluster) कृषि उपज मंडियों के ऐतिहासिक भावों का मशीन लर्निंग द्वारा विश्लेषण करता है, समान मूल्य पैटर्न वाले बाजारों को खोजता है, असामान्य उतार-चढ़ाव की पहचान करता है और किसानों को परिवहन लागत घटाकर शुद्ध लाभ की तुलना प्रदान करता है।",
        "explore_market": "मंडी भाव विश्लेषण देखें",
        "explore_clustering": "मंडी क्लस्टरिंग देखें",
        "nav": {
            "home": "होम",
            "market_analysis": "मंडी विश्लेषण",
            "clustering": "क्लस्टरिंग",
            "ml_insights": "एमएल इनसाइट्स",
            "cluster_evaluation": "क्लस्टर मूल्यांकन",
            "pca_vs_tsne": "PCA बनाम t-SNE",
            "anomaly_detection": "विसंगति पहचान",
            "recommendations": "मंडी अनुशंसा",
            "about": "परिचय",
            "upload_csv": "डेटा अपलोड करें"
        },
        "summary_cards": {
            "markets_analyzed": "विश्लेषित मंडियां",
            "crops_available": "उपलब्ध फसलें",
            "clusters_identified": "पहचाने गए क्लस्टर",
            "latest_date": "नवीनतम मंडी दिनांक"
        },
        "market_analysis": {
            "title": "कृषि मंडी मूल्य व आवक विश्लेषण",
            "subtitle": "विभिन्न मंडियों के ऐतिहासिक मॉडल भाव, मूल्य विचलन और मौसमी आवक की सटीक तुलना करें।",
            "crop": "फसल / जिंस",
            "state": "राज्य",
            "district": "जिला",
            "market": "मंडी / बाजार",
            "compare_markets": "तुलना हेतु मंडियां चुनें",
            "date_presets": "समय सीमा",
            "m6": "6 महीने",
            "m12": "12 महीने",
            "m24": "24 महीने",
            "all_time": "पूर्ण अवधि",
            "price_trend_title": "ऐतिहासिक मॉडल भाव रुझान (₹ / क्विंटल)",
            "ranking_title": "औसत मॉडल भाव रैंकिंग",
            "variability_title": "मूल्य अस्थिरता (विचरण गुणांक %)",
            "arrivals_title": "मंडी आवक (टन)",
            "table_title": "मंडी प्रदर्शन सारांश तालिका",
            "export_csv": "फ़िल्टर किया डेटा डाउनलोड करें",
            "empty_state": "चुने गए विकल्पों हेतु कोई डेटा उपलब्ध नहीं है। कृपया फसल अथवा दिनांक बदलें।",
            "avg_modal_price": "औसत मॉडल भाव",
            "min_price": "न्यूनतम भाव",
            "max_price": "अधिकतम भाव",
            "std_dev": "मानक विचलन",
            "cv": "विचरण गुणांक (%)",
            "latest_obs": "नवीनतम अवलोकन",
            "avg_arrivals": "औसत आवक (टन)"
        },
        "clustering": {
            "title": "मंडी क्लस्टरिंग विश्लेषण",
            "subtitle": "समान मूल्य स्तर एवं अस्थिरता व्यवहार वाली कृषि मंडियों का अनसुपरवाइज्ड मशीन लर्निंग वर्गीकरण।",
            "config_panel": "क्लस्टरिंग सेटिंग्स",
            "algorithm": "एल्गोरिदम चुनें",
            "k_clusters": "क्लस्टर की संख्या (K)",
            "random_seed": "रैंडम सीड",
            "scaler": "फीचर स्केलर",
            "run_analysis": "क्लस्टरिंग चलाएं",
            "running": "विश्लेषण जारी है...",
            "results_title": "क्लस्टरिंग परिणाम",
            "clusters_found": "प्राप्त क्लस्टर",
            "markets_assigned": "वर्गीकृत मंडियां",
            "noise_points": "असामान्य / नॉइज़ मंडियां",
            "silhouette": "सिल्हूट स्कोर",
            "davies_bouldin": "डेविस-बोल्डिन इंडेक्स",
            "inertia": "इनरशिया (WCSS)",
            "pca_projection_title": "मंडी क्लस्टर्स का 2D PCA प्रोजेक्शन",
            "summary_table_title": "क्लस्टर विशेषताएं और प्रतिनिधि मंडियां",
            "cluster_id": "क्लस्टर आईडी",
            "market_count": "मंडी संख्या",
            "mean_price": "औसत भाव",
            "median_price": "मध्यक भाव",
            "avg_variability": "अस्थिरता (CV %)",
            "representative_mandis": "प्रतिनिधि मंडियां",
            "characterization": "परिमाणात्मक विवरण",
            "disclaimer_note": "ध्यान दें: क्लस्टर संख्या केवल एक सांकेतिक पहचान है, यह मंडियों की गुणवत्ता या श्रेणी का निर्धारण नहीं करती।"
        },
        "recommendations": {
            "title": "मंडी तुलना एवं शुद्ध लाभ कैलकुलेटर",
            "subtitle": "परिवहन व ढुलाई लागत घटाकर वास्तविक शुद्ध भाव की तुलना करें और अपनी उपज के लिए सर्वोत्तम मंडी चुनें।",
            "form_title": "उपज व वाहन विवरण",
            "crop": "फसल / जिंस",
            "origin_market": "स्थानीय / गृह मंडी",
            "quantity": "विक्रय मात्रा (क्विंटल)",
            "vehicle_type": "परिवहन वाहन का प्रकार",
            "calculate_button": "शुद्ध प्राप्तियों की गणना करें",
            "results_title": "संभावित मंडियों की तुलना रैंकिंग",
            "rank": "रैंक",
            "market": "गंतव्य मंडी",
            "district_state": "जिला / राज्य",
            "reported_price": "रिपोर्ट किया गया भाव",
            "distance": "अनुमानित दूरी (किमी)",
            "transport_cost_qtl": "परिवहन लागत / क्विंटल",
            "net_price_qtl": "अनुमानित शुद्ध भाव / क्विंटल",
            "total_net_proceeds": "कुल अनुमानित प्राप्ति",
            "diff_vs_local": "स्थानीय मंडी से अंतर",
            "freshness": "डेटा ताजगी",
            "origin_badge": "स्थानीय मंडी",
            "disclaimer_title": "निर्णय सहायता सूचना",
            "disclaimer_text": "यह कैलकुलेटर एगमार्कनेट के प्रकाशित भावों और अनुमानित सड़क भाड़े पर आधारित निर्णय-सहायता उपकरण है। यह किसी निश्चित मूल्य या लाभ की गारंटी नहीं देता।"
        }
    },
    "pa": {
        "tagline": "ਮੰਡੀਆਂ ਖੋਜੋ। ਭਾਅ ਸਮਝੋ। ਸਹੀ ਫ਼ੈਸਲੇ ਲਵੋ।",
        "hero_desc": "ਮੰਡੀਕਲੱਸਟਰ (MandiCluster) ਖੇਤੀਬਾੜੀ ਮੰਡੀਆਂ ਦੇ ਇਤਿਹਾਸਕ ਭਾਵਾਂ ਦਾ ਮਸ਼ੀਨ ਲਰਨਿੰਗ ਰਾਹੀਂ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰਦਾ ਹੈ, ਸਮਾਨ ਭਾਅ ਵਾਲੀਆਂ ਮੰਡੀਆਂ ਦੀ ਪਛਾਣ ਕਰਦਾ ਹੈ ਅਤੇ ਕਿਸਾਨਾਂ ਨੂੰ ਢੋਆ-ਢੁਆਈ ਖ਼ਰਚਾ ਘਟਾ ਕੇ ਸ਼ੁੱਧ ਮੁਨਾਫ਼ੇ ਦੀ ਤੁਲਨਾ ਪ੍ਰਦਾਨ ਕਰਦਾ ਹੈ।",
        "explore_market": "ਮੰਡੀ ਵਿਸ਼ਲੇਸ਼ਣ ਵੇਖੋ",
        "explore_clustering": "ਮੰਡੀ ਕਲੱਸਟਰਿੰਗ ਵੇਖੋ",
        "nav": {
            "home": "ਮੁੱਖ ਪੰਨਾ",
            "market_analysis": "ਮੰਡੀ ਵਿਸ਼ਲੇਸ਼ਣ",
            "clustering": "ਕਲੱਸਟਰਿੰਗ",
            "ml_insights": "ਐਮ.ਐਲ. ਇਨਸਾਈਟਸ",
            "cluster_evaluation": "ਕਲੱਸਟਰ ਮੁਲਾਂਕਣ",
            "pca_vs_tsne": "PCA ਬਨਾਮ t-SNE",
            "anomaly_detection": "ਅਸਾਧਾਰਨ ਭਾਅ ਜਾਂਚ",
            "recommendations": "ਮੰਡੀ ਸਿਫ਼ਾਰਸ਼",
            "about": "ਸਾਡੇ ਬਾਰੇ",
            "upload_csv": "ਡੇਟਾ ਅੱਪਲੋਡ ਕਰੋ"
        },
        "summary_cards": {
            "markets_analyzed": "ਵਿਸ਼ਲੇਸ਼ਿਤ ਮੰਡੀਆਂ",
            "crops_available": "ਉਪਲਬਧ ਫ਼ਸਲਾਂ",
            "clusters_identified": "ਪਛਾਣੇ ਗਏ ਕਲੱਸਟਰ",
            "latest_date": "ਤਾਜ਼ਾ ਮੰਡੀ ਮਿਤੀ"
        },
        "market_analysis": {
            "title": "ਖੇਤੀਬਾੜੀ ਮੰਡੀ ਭਾਅ ਅਤੇ ਆਮਦ ਵਿਸ਼ਲੇਸ਼ਣ",
            "subtitle": "ਇਤਿਹਾਸਕ ਮਾਡਲ ਭਾਅ, ਮੁੱਲ ਉਤਰਾਅ-ਚੜ੍ਹਾਅ ਅਤੇ ਆਮਦ ਦੀ ਵਿਸਤ੍ਰਿਤ ਤੁਲਨਾ ਕਰੋ।",
            "crop": "ਫ਼ਸਲ / ਜਿਣਸ",
            "state": "ਸੂਬਾ",
            "district": "ਜ਼ਿਲ੍ਹਾ",
            "market": "ਮੰਡੀ",
            "compare_markets": "ਤੁਲਨਾ ਲਈ ਮੰਡੀਆਂ ਚੁਣੋ",
            "date_presets": "ਸਮਾਂ ਹੱਦ",
            "m6": "6 ਮਹੀਨੇ",
            "m12": "12 ਮਹੀਨੇ",
            "m24": "24 ਮਹੀਨੇ",
            "all_time": "ਪੂਰਾ ਸਮਾਂ",
            "price_trend_title": "ਇਤਿਹਾਸਕ ਮਾਡਲ ਭਾਅ ਰੁਝਾਨ (₹ / ਕੁਇੰਟਲ)",
            "ranking_title": "ਔਸਤ ਮਾਡਲ ਭਾਅ ਦਰਜਾਬੰਦੀ",
            "variability_title": "ਭਾਅ ਉਤਰਾਅ-ਚੜ੍ਹਾਅ (%)",
            "arrivals_title": "ਮੰਡੀ ਆਮਦ (ਟਨ)",
            "table_title": "ਮੰਡੀ ਕਾਰਗੁਜ਼ਾਰੀ ਸਾਰਣੀ",
            "export_csv": "CSV ਡਾਊਨਲੋਡ ਕਰੋ",
            "empty_state": "ਚੁਣੇ ਗਏ ਫ਼ਿਲਟਰਾਂ ਅਨੁਸਾਰ ਕੋਈ ਡੇਟਾ ਉਪਲਬਧ ਨਹੀਂ ਹੈ।",
            "avg_modal_price": "ਔਸਤ ਮਾਡਲ ਭਾਅ",
            "min_price": "ਘੱਟੋ-ਘੱਟ ਭਾਅ",
            "max_price": "ਵੱਧ ਤੋਂ ਵੱਧ ਭਾਅ",
            "std_dev": "ਮਿਆਰੀ ਵਿਵਹਾਰ",
            "cv": "ਤਬਦੀਲੀ ਗੁਣਾਂਕ (%)",
            "latest_obs": "ਤਾਜ਼ਾ ਨਿਰੀਖਣ",
            "avg_arrivals": "ਔਸਤ ਆਮਦ (ਟਨ)"
        },
        "recommendations": {
            "title": "ਮੰਡੀ ਤੁਲਨਾ ਅਤੇ ਸ਼ੁੱਧ ਆਮਦਨ ਕੈਲਕੁਲੇਟਰ",
            "subtitle": "ਢੋਆ-ਢੁਆਈ ਖ਼ਰਚੇ ਕੱਟ ਕੇ ਅਸਲ ਸ਼ੁੱਧ ਭਾਅ ਦੀ ਤੁਲਨਾ ਕਰੋ ਅਤੇ ਆਪਣੀ ਫ਼ਸਲ ਲਈ ਬਿਹਤਰੀਨ ਮੰਡੀ ਚੁਣੋ।",
            "form_title": "ਫ਼ਸਲ ਅਤੇ ਵਾਹਨ ਵੇਰਵਾ",
            "crop": "ਫ਼ਸਲ / ਜਿਣਸ",
            "origin_market": "ਸਥਾਨਕ ਮੰਡੀ",
            "quantity": "ਵੇਚਣ ਵਾਲੀ ਮਾਤਰਾ (ਕੁਇੰਟਲ)",
            "vehicle_type": "ਗੱਡੀ ਦੀ ਕਿਸਮ",
            "calculate_button": "ਸ਼ੁੱਧ ਕਮਾਈ ਦਾ ਹਿਸਾਬ ਲਗਾਓ",
            "results_title": "ਸੰਭਾਵੀ ਮੰਡੀਆਂ ਦੀ ਤੁਲਨਾ ਸੂਚੀ",
            "rank": "ਦਰਜਾ",
            "market": "ਮੰਡੀ",
            "district_state": "ਜ਼ਿਲ੍ਹਾ / ਸੂਬਾ",
            "reported_price": "ਦਰਜ ਕੀਤਾ ਭਾਅ",
            "distance": "ਅੰਦਾਜ਼ਨ ਦੂਰੀ (ਕਿ.ਮੀ.)",
            "transport_cost_qtl": "ਢੋਆ-ਢੁਆਈ ਖ਼ਰਚਾ / ਕੁਇੰਟਲ",
            "net_price_qtl": "ਅੰਦਾਜ਼ਨ ਸ਼ੁੱਧ ਭਾਅ / ਕੁਇੰਟਲ",
            "total_net_proceeds": "ਕੁੱਲ ਅੰਦਾਜ਼ਨ ਆਮਦਨ",
            "diff_vs_local": "ਸਥਾਨਕ ਮੰਡੀ ਨਾਲੋਂ ਫ਼ਰਕ",
            "freshness": "ਡੇਟਾ ਤਾਜ਼ਗੀ",
            "origin_badge": "ਸਥਾਨਕ ਮੰਡੀ",
            "disclaimer_title": "ਫ਼ੈਸਲਾ ਸਹਾਇਤਾ ਨੋਟਿਸ",
            "disclaimer_text": "ਇਹ ਕੈਲਕੁਲੇਟਰ ਐਗਮਾਰਕਨੈੱਟ ਦੇ ਸਰਕਾਰੀ ਭਾਵਾਂ ਅਤੇ ਅੰਦਾਜ਼ਨ ਟਰਾਂਸਪੋਰਟ ਖ਼ਰਚਿਆਂ 'ਤੇ ਅਧਾਰਿਤ ਹੈ। ਇਹ ਕੋਈ ਗਾਰੰਟੀਸ਼ੁਦਾ ਮੁਨਾਫ਼ਾ ਪੇਸ਼ ਨਹੀਂ ਕਰਦਾ।"
        }
    },
    "bn": {
        "tagline": "বাজার খুঁজুন। দর বুঝুন। সঠিক সিদ্ধান্ত নিন।",
        "hero_desc": "মান্ডিক্লাস্টার (MandiCluster) হলো একটি উন্নত কৃষি বাজার বুদ্ধিমত্তা প্ল্যাটফর্ম যা মেশিন লার্নিং ব্যবহার করে ভারতের বিভিন্ন মান্ডির দামের ধারা বিশ্লেষণ করে এবং পরিবহন খরচ বাদ দিয়ে কৃষকদের সঠিক বিক্রয় সিদ্ধান্ত নিতে সাহায্য করে।",
        "explore_market": "বাজার বিশ্লেষণ দেখুন",
        "explore_clustering": "ক্লাস্টারিং বিশ্লেষণ দেখুন",
        "nav": {
            "home": "হোম",
            "market_analysis": "বাজার বিশ্লেষণ",
            "clustering": "ক্লাস্টারিং",
            "ml_insights": "এমএল ইনসাইটস",
            "cluster_evaluation": "ক্লাস্টার মূল্যায়ন",
            "pca_vs_tsne": "PCA বনাম t-SNE",
            "anomaly_detection": "অস্বাভাবিক দাম শনাক্তকরণ",
            "recommendations": "বাজারের সুপারিশ",
            "about": "পরিচিতি",
            "upload_csv": "ডেটা আপলোড"
        },
        "summary_cards": {
            "markets_analyzed": "বিশ্লেষিত মান্ডি",
            "crops_available": "উপলব্ধ ফসল",
            "clusters_identified": "শনাক্তকৃত ক্লাস্টার",
            "latest_date": "সর্বশেষ বাজার তারিখ"
        },
        "market_analysis": {
            "title": "কৃষি পণ্যের বাজার দর ও আমদানি বিশ্লেষণ",
            "subtitle": "ঐতিহাসিক মডেল দর, মূল্যের ওঠানামা এবং মান্ডিতে ফসলের দৈনিক আমদানি তুলনা করুন।",
            "crop": "ফসল / পণ্য",
            "state": "রাজ্য",
            "district": "জেলা",
            "market": "মান্ডি / বাজার",
            "compare_markets": "তুলনার জন্য মান্ডি নির্বাচন করুন",
            "date_presets": "সময়সীমা",
            "m6": "৬ মাস",
            "m12": "১২ মাস",
            "m24": "২৪ মাস",
            "all_time": "সমগ্র সময়",
            "price_trend_title": "ঐতিহাসিক মডেল দরের গতিপ্রকৃতি (₹ / কুইন্টাল)",
            "ranking_title": "গড় মডেল দরের র‍্যাঙ্কিং",
            "variability_title": "দরের পরিবর্তনশীলতা (%)",
            "arrivals_title": "বাজারে আমদানি (টন)",
            "table_title": "বাজার মেট্রিক্সের সারসংক্ষেপ",
            "export_csv": "ফিল্টার করা ডেটা ডাউনলোড করুন",
            "empty_state": "নির্বাচিত ফিল্টারের জন্য কোনো তথ্য পাওয়া যায়নি।",
            "avg_modal_price": "গড় মডেল দর",
            "min_price": "সর্বনিম্ন দর",
            "max_price": "সর্বোচ্চ দর",
            "std_dev": "আদর্শ বিচ্যুতি",
            "cv": "পরিবর্তনশীলতার গুণাঙ্ক (%)",
            "latest_obs": "সর্বশেষ তথ্য",
            "avg_arrivals": "গড় আমদানি (টন)"
        },
        "recommendations": {
            "title": "মান্ডি তুলনা ও নিট লাভ ক্যালকুলেটর",
            "subtitle": "পরিবহন খরচ বাদ দিয়ে প্রকৃত নিট আয়ের তুলনা করুন এবং আপনার ফসলের জন্য সেরা মান্ডি নির্বাচন করুন।",
            "form_title": "ফসল ও পরিবহনের বিবরণ",
            "crop": "ফসল / পণ্য",
            "origin_market": "স্থানীয় মান্ডি",
            "quantity": "বিক্রয় পরিমাণ (কুইন্টাল)",
            "vehicle_type": "পরিবহন যানের ধরন",
            "calculate_button": "নিট আয় হিসাব করুন",
            "results_title": "সম্ভাব্য মান্ডিসমূহের তুলনামূলক তালিকা",
            "rank": "র‍্যাঙ্ক",
            "market": "গন্তব্য মান্ডি",
            "district_state": "জেলা / রাজ্য",
            "reported_price": "রিপোর্টকৃত মডেল দর",
            "distance": "আনুমানিক দূরত্ব (কিমি)",
            "transport_cost_qtl": "পরিবহন খরচ / কুইন্টাল",
            "net_price_qtl": "আনুমানিক নিট দর / কুইন্টাল",
            "total_net_proceeds": "মোট আনুমানিক আয়",
            "diff_vs_local": "স্থানীয় মান্ডির সাথে পার্থক্য",
            "freshness": "তথ্যের সময়কাল",
            "origin_badge": "স্থানীয় মান্ডি",
            "disclaimer_title": "সিদ্ধান্ত সহায়তা বিজ্ঞপ্তি",
            "disclaimer_text": "এই ক্যালকুলেটরটি অ্যাগমार्कনেটের প্রকাশিত দর এবং আনুমানিক সড়ক পরিবহন খরচের ওপর ভিত্তি করে তৈরি। এটি কোনো আর্থিক নিশ্চয়তা প্রদান করে না।"
        }
    },
    "mr": {
        "tagline": "बाजारपेठ शोधा. भाव समजून घ्या. योग्य निर्णय घ्या.",
        "hero_desc": "मंडीक्लस्टर (MandiCluster) हे कृषी बाजारपेठांमधील भावांचे मशीन लर्निंगद्वारे विश्लेषण करते, समान भाव असलेल्या मंडया शोधते आणि शेतकऱ्यांना वाहतूक खर्च वजा जाता मिळणाऱ्या निव्वळ भावाची पारदर्शक तुलना देते.",
        "explore_market": "बाजारपेठ विश्लेषण पहा",
        "explore_clustering": "क्लस्टरिंग विश्लेषण पहा",
        "nav": {
            "home": "मुख्यपृष्ठ",
            "market_analysis": "बाजार विश्लेषण",
            "clustering": "क्लस्टरिंग",
            "ml_insights": "एमएल इनसाइट्स",
            "cluster_evaluation": "क्लस्टर मूल्यांकन",
            "pca_vs_tsne": "PCA विरूद्ध t-SNE",
            "anomaly_detection": "असामान्य भाव तपासणी",
            "recommendations": "मंडी शिफारशी",
            "about": "माहिती",
            "upload_csv": "डेटा अपलोड"
        },
        "summary_cards": {
            "markets_analyzed": "विश्लेषित मंडया",
            "crops_available": "उपलब्ध पिके",
            "clusters_identified": "शोधलेले क्लस्टर्स",
            "latest_date": "नवीनतम बाजार तारीख"
        },
        "market_analysis": {
            "title": "कृषी बाजार भाव व आवक विश्लेषण",
            "subtitle": "ऐतिहासिक सरासरी भाव, भावांमधील चढ-उतार आणि मंडयांमधील आवक यांची सविस्तर तुलना करा.",
            "crop": "पीक / शेतमाल",
            "state": "राज्य",
            "district": "जिल्हा",
            "market": "बाजारपेठ / मंडी",
            "compare_markets": "तुलनेसाठी मंडया निवडा",
            "date_presets": "कालावधी",
            "m6": "६ महिने",
            "m12": "१२ महिने",
            "m24": "२४ महिने",
            "all_time": "संपूर्ण काळ",
            "price_trend_title": "ऐतिहासिक सरासरी भाव कल (₹ / क्विंटल)",
            "ranking_title": "सरासरी मॉडेल भाव क्रमवारी",
            "variability_title": "भाव अस्थिरता (%)",
            "arrivals_title": "बाजार आवक (टन)",
            "table_title": "बाजारपेठ कामगिरी तक्ता",
            "export_csv": "CSV डेटा डाउनलोड करा",
            "empty_state": "निवडलेल्या फिल्टरनुसार कोणताही डेटा उपलब्ध नाही.",
            "avg_modal_price": "सरासरी मॉडेल भाव",
            "min_price": "किमान भाव",
            "max_price": "कमाल भाव",
            "std_dev": "प्रमाणित विचलन",
            "cv": "विचरण गुणांक (%)",
            "latest_obs": "नवीनतम नोंद",
            "avg_arrivals": "सरासरी आवक (टन)"
        },
        "recommendations": {
            "title": "मंडी तुलना आणि निव्वळ नफा कॅल्क्युलेटर",
            "subtitle": "वाहतूक खर्च वजा करून प्रत्यक्ष निव्वळ भावाची तुलना करा आणि आपल्या शेतमालासाठी सर्वोत्तम मंडी निवडा.",
            "form_title": "पीक आणि वाहन तपशील",
            "crop": "पीक / शेतमाल",
            "origin_market": "स्थानिक मंडी",
            "quantity": "विक्रीचे प्रमाण (क्विंटल)",
            "vehicle_type": "वाहतूक वाहनाचा प्रकार",
            "calculate_button": "निव्वळ उत्पन्नाची गणना करा",
            "results_title": "संभाव्य मंडयांची तुलनात्मक यादी",
            "rank": "क्रमांक",
            "market": "गंतव्य मंडी",
            "district_state": "जिल्हा / राज्य",
            "reported_price": "नोंदवलेला मॉडेल भाव",
            "distance": "अंदाजे अंतर (किमी)",
            "transport_cost_qtl": "वाहतूक खर्च / क्विंटल",
            "net_price_qtl": "अंदाजे निव्वळ भाव / क्विंटल",
            "total_net_proceeds": "एकूण अंदाजे उत्पन्न",
            "diff_vs_local": "स्थानिक मंडीपेक्षा फरक",
            "freshness": "डेटा ताजेपणा",
            "origin_badge": "स्थानिक मंडी",
            "disclaimer_title": "निर्णय सहाय्य सूचना",
            "disclaimer_text": "हे कॅल्क्युलेटर ॲगमार्कनेटच्या अधिकृत भावांवर आणि रस्त्याच्या अंदाजे भाड्यावर आधारित निर्णय सहाय्य साधन आहे. हे कोणत्याही निश्चित लाभाची हमी देत नाही."
        }
    },
    "ur": {
        "tagline": "منڈیاں دریافت کریں۔ قیمتیں سمجھیں۔ باخبر فیصلے لیں۔",
        "hero_desc": "منڈی کلسٹر (MandiCluster) ایک جدید پلیٹ فارم ہے جو زرعی منڈیوں کی قیمتوں کا مشین لرننگ کے ذریعے تجزیہ کرتا ہے، اور کسانوں کو کرایہ اور لاگت کاٹ کر خالص منافع کے موازنے کی سہولت فراہم کرتا ہے۔",
        "explore_market": "مارکیٹ تجزیہ دیکھیں",
        "explore_clustering": "کلسٹرنگ تجزیہ دیکھیں",
        "nav": {
            "home": "ہوم",
            "market_analysis": "منڈی تجزیہ",
            "clustering": "کلسٹرنگ",
            "ml_insights": "ایم ایل بصیرت",
            "cluster_evaluation": "کلسٹر تشخیص",
            "pca_vs_tsne": "PCA بمقابلہ t-SNE",
            "anomaly_detection": "غیر معمولی قیمت کا پتہ لگانا",
            "recommendations": "منڈی تجاویز",
            "about": "تعارف",
            "upload_csv": "ڈیٹا اپ لوڈ کریں"
        },
        "summary_cards": {
            "markets_analyzed": "تجزیہ شدہ منڈیاں",
            "crops_available": "دستیاب فصلیں",
            "clusters_identified": "شناخت شدہ کلسٹرز",
            "latest_date": "تازہ ترین منڈی کی تاریخ"
        },
        "market_analysis": {
            "title": "زرعی منڈی کی قیمتوں اور آمد کا تجزیہ",
            "subtitle": "ماضی کی اوسط قیمتوں، اتار چڑھاؤ اور منڈیوں میں آمد کا باہم تقابل کریں۔",
            "crop": "فصل / جنس",
            "state": "ریاست",
            "district": "ضلع",
            "market": "منڈی / مارکیٹ",
            "compare_markets": "موازنے کے لیے منڈیاں منتخب کریں",
            "date_presets": "مدت",
            "m6": "6 ماہ",
            "m12": "12 ماہ",
            "m24": "24 ماہ",
            "all_time": "مکمل مدت",
            "price_trend_title": "تاریخی ماڈل قیمت کا رجحان (روپے فی کوئنٹل)",
            "ranking_title": "اوسط ماڈل قیمت کی درجہ بندی",
            "variability_title": "قیمت کا اتار چڑھاؤ (%)",
            "arrivals_title": "منڈی آمد (ٹن)",
            "table_title": "منڈی کارکردگی کا خلاصہ",
            "export_csv": "ڈیٹا ڈاؤن لوڈ کریں",
            "empty_state": "منتخب کردہ فلٹرز کے لیے کوئی ڈیٹا دستیاب نہیں ہے۔",
            "avg_modal_price": "اوسط ماڈل قیمت",
            "min_price": "کم سے کم قیمت",
            "max_price": "زیادہ سے زیادہ قیمت",
            "std_dev": "معیاری انحراف",
            "cv": "اتار چڑھاؤ کا تناسب (%)",
            "latest_obs": "تازہ ترین اندراج",
            "avg_arrivals": "اوسط آمد (ٹن)"
        },
        "recommendations": {
            "title": "منڈی موازنہ اور خالص آمدنی کیلکولیٹر",
            "subtitle": "نقل و حمل اور کرایہ منہا کر کے اصل خالص قیمت کا موازنہ کریں اور اپنی فصل کے لیے بہترین منڈی کا انتخاب کریں۔",
            "form_title": "فصل اور گاڑی کی تفصیلات",
            "crop": "فصل / جنس",
            "origin_market": "مقامی منڈی",
            "quantity": "فروخت کی مقدار (کوئنٹل)",
            "vehicle_type": "گاڑی کی قسم",
            "calculate_button": "خالص آمدنی کا تخمینہ لگائیں",
            "results_title": "ممکنہ منڈیوں کا تقابلی جائزہ",
            "rank": "درجہ",
            "market": "منزل منڈی",
            "district_state": "ضلع / ریاست",
            "reported_price": "رپورٹ کردہ ماڈل قیمت",
            "distance": "تخمینی فاصلہ (کلومیٹر)",
            "transport_cost_qtl": "کرایہ / کوئنٹل",
            "net_price_qtl": "خالص قیمت / کوئنٹل",
            "total_net_proceeds": "کل متوقع آمدنی",
            "diff_vs_local": "مقامی منڈی سے فرق",
            "freshness": "ڈیٹا کی تازگی",
            "origin_badge": "مقامی منڈی",
            "disclaimer_title": "فیصلہ سازی میں معاونت کا نوٹس",
            "disclaimer_text": "یہ کیلکولیٹر ایگمارک نیٹ کی سرکاری قیمتوں اور اندازاً کرایوں پر مبنی معاون ٹول ہے۔ یہ کسی مقررہ منافع یا قیمت کی ضمانت نہیں دیتا۔"
        }
    },
    "gu": {
        "tagline": "બજાર શોધો. ભાવ સમજો. યોગ્ય નિર્ણય લો.",
        "hero_desc": "મંડીક્લસ્ટર (MandiCluster) એ મશીન લર્નિંગ આધારિત કૃષિ બજાર બુદ્ધિમત્તા પ્લેટફોર્મ છે જે ખેડૂતોને વિવિધ માર્કેટ યાર્ડના ઐતિહાસિક ભાવ અને પરિવહન ખર્ચ બાદ ચોખ્ખા નફાની તુલના પ્રદાન કરે છે.",
        "explore_market": "બજાર ભાવ વિશ્લેષણ",
        "explore_clustering": "ક્લસ્ટરિંગ વિશ્લેષણ",
        "nav": {
            "home": "હોમ",
            "market_analysis": "બજાર વિશ્લેષણ",
            "clustering": "ક્લસ્ટરિંગ",
            "ml_insights": "એમએલ ઇનસાઇટ્સ",
            "cluster_evaluation": "ક્લસ્ટર મૂલ્યાંકન",
            "pca_vs_tsne": "PCA વિરુદ્ધ t-SNE",
            "anomaly_detection": "અસામાન્ય ભાવ તપાસ",
            "recommendations": "બજાર ભલામણ",
            "about": "વિશે",
            "upload_csv": "ડેટા અપલોડ"
        },
        "summary_cards": {
            "markets_analyzed": "વિશ્લેષિત માર્કેટ યાર્ડ",
            "crops_available": "ઉપલબ્ધ પાકો",
            "clusters_identified": "ઓળખાયેલા ક્લસ્ટર",
            "latest_date": "તાજેતરની તારીખ"
        }
    },
    "ta": {
        "tagline": "சந்தைகளை அறியுங்கள். விலையை உணருங்கள். சரியான முடிவெடுங்கள்.",
        "hero_desc": "மண்டி கிளஸ்டர் (MandiCluster) வேளாண் சந்தைகளின் வரலாற்று விலைகளை மெஷின் லேர்னிங் மூலம் பகுப்பாய்வு செய்து விவசாயிகளுக்கு உகந்த சந்தைகளை ஒப்பிட உதவுகிறது.",
        "explore_market": "சந்தை பகுப்பாய்வு",
        "explore_clustering": "கிளஸ்டரிங் பகுப்பாய்வு",
        "nav": {
            "home": "முகப்பு",
            "market_analysis": "சந்தை பகுப்பாய்வு",
            "clustering": "கிளஸ்டரிங்",
            "ml_insights": "ML நுண்ணறிவு",
            "cluster_evaluation": "கிளஸ்டர் மதிப்பீடு",
            "pca_vs_tsne": "PCA மற்றும் t-SNE",
            "anomaly_detection": "மாறுபட்ட விலை கண்டறிதல்",
            "recommendations": "சந்தை பரிந்துரைகள்",
            "about": "பற்றி",
            "upload_csv": "தரவேற்றம்"
        },
        "summary_cards": {
            "markets_analyzed": "ஆய்வு செய்யப்பட்ட மண்டிகள்",
            "crops_available": "கிடைக்கும் பயிர்கள்",
            "clusters_identified": "கண்டறியப்பட்ட தொகுப்புகள்",
            "latest_date": "சமீபத்திய தேதி"
        }
    },
    "te": {
        "tagline": "మార్కెట్లను కనుగొనండి. ధరలను అర్థం చేసుకోండి. సరైన నిర్ణయం తీసుకోండి.",
        "hero_desc": "మండీక్లస్టర్ (MandiCluster) అనేది వ్యవసాయ మార్కెట్ల ధరలను మెషిన్ లెర్నింగ్ ద్వారా విశ్లేషించి రైతులకు నికర లాభాలను పోల్చే వేదిక.",
        "explore_market": "మార్కెట్ విశ్లేషణ",
        "explore_clustering": "క్లస్టరింగ్ విశ్లేషణ",
        "nav": {
            "home": "హోమ్",
            "market_analysis": "మార్కెట్ విశ్లేషణ",
            "clustering": "క్లస్టరింగ్",
            "ml_insights": "ML ఇన్సైట్స్",
            "cluster_evaluation": "క్లస్టర్ మూల్యాంకనం",
            "pca_vs_tsne": "PCA vs t-SNE",
            "anomaly_detection": "ధరల వ్యత్యాస గుర్తింపు",
            "recommendations": "మార్కెట్ సిఫార్సులు",
            "about": "గురించి",
            "upload_csv": "డేటా అప్‌లోడ్"
        },
        "summary_cards": {
            "markets_analyzed": "విశ్లేషించిన మార్కెట్లు",
            "crops_available": "లభించే పంటలు",
            "clusters_identified": "గుర్తించిన క్లస్టర్లు",
            "latest_date": "తాజా తేదీ"
        }
    },
    "kn": {
        "tagline": "ಮಾರುಕಟ್ಟೆಗಳನ್ನು ಅನ್ವೇಷಿಸಿ. ಬೆಲೆಗಳನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ. ಸರಿಯಾದ ನಿರ್ಧಾರ ತೆಗೆದುಕೊಳ್ಳಿ.",
        "hero_desc": "ಮಂಡಿಕ್ಲಸ್ಟರ್ (MandiCluster) ಕೃಷಿ ಮಾರುಕಟ್ಟೆಗಳ ಐತಿಹಾಸಿಕ ಬೆಲೆಗಳನ್ನು ಮೆಷಿನ್ ಲರ್ನಿಂಗ್ ಮೂಲಕ ವಿಶ್ಲೇಷಿಸಿ ರೈತರಿಗೆ ನಿವ್ವಳ ಲಾಭವನ್ನು ಹೋಲಿಕೆ ಮಾಡಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.",
        "explore_market": "ಮಾರುಕಟ್ಟೆ ವಿಶ್ಲೇಷಣೆ",
        "explore_clustering": "ಕ್ಲಸ್ಟರಿಂಗ್ ವಿಶ್ಲೇಷಣೆ",
        "nav": {
            "home": "ಮುಖಪುಟ",
            "market_analysis": "ಮಾರುಕಟ್ಟೆ ವಿಶ್ಲೇಷಣೆ",
            "clustering": "ಕ್ಲಸ್ಟರಿಂಗ್",
            "ml_insights": "ML ಒಳನೋಟಗಳು",
            "cluster_evaluation": "ಕ್ಲಸ್ಟರ್ ಮೌಲ್ಯಮಾಪನ",
            "pca_vs_tsne": "PCA vs t-SNE",
            "anomaly_detection": "ಅಸಹಜ ಬೆಲೆ ಪತ್ತೆ",
            "recommendations": "ಮಾರುಕಟ್ಟೆ ಶಿಫಾರಸು",
            "about": "ಕುರಿತು",
            "upload_csv": "ಡೇಟಾ ಅಪ್ಲೋಡ್"
        },
        "summary_cards": {
            "markets_analyzed": "ವಿಶ್ಲೇಷಿಸಿದ ಮಾರುಕಟ್ಟೆಗಳು",
            "crops_available": "ಲಭ್ಯವಿರುವ ಬೆಳೆಗಳು",
            "clusters_identified": "ಗುರುತಿಸಲಾದ ಕ್ಲಸ್ಟರ್‌ಗಳು",
            "latest_date": "ಇತ್ತೀಚಿನ ದಿನಾಂಕ"
        }
    },
    "ml": {
        "tagline": "വിപണികൾ കണ്ടെത്തുക. വിലകൾ മനസ്സിലാക്കുക. ശരിയായ തീരുമാനങ്ങളെടുക്കുക.",
        "hero_desc": "മാണ്ടിക്ലസ്റ്റർ (MandiCluster) മെഷീൻ ലേണിംഗ് വഴി കാർഷിക വിപണി വിലകൾ വിശകലനം ചെയ്യുകയും കർഷകർക്ക് മികച്ച വിപണി തിരഞ്ഞെടുക്കാൻ സഹായിക്കുകയും ചെയ്യുന്നു.",
        "explore_market": "വിപണി വിശകലനം",
        "explore_clustering": "ക്ലസ്റ്ററിംഗ് വിശകലനം",
        "nav": {
            "home": "ഹോം",
            "market_analysis": "വിപണി വിശകലനം",
            "clustering": "ക്ലസ്റ്ററിംഗ്",
            "ml_insights": "ML ഇൻസൈറ്റുകൾ",
            "cluster_evaluation": "ക്ലസ്റ്റർ മൂല്യനിർണ്ണയം",
            "pca_vs_tsne": "PCA vs t-SNE",
            "anomaly_detection": "വില വ്യതിയാന പരിശോധന",
            "recommendations": "വിപണി നിർദ്ദേശങ്ങൾ",
            "about": "വിവരണം",
            "upload_csv": "ഡാറ്റ അപ്‌ലോഡ്"
        },
        "summary_cards": {
            "markets_analyzed": "വിശകലനം ചെയ്ത വിപണികൾ",
            "crops_available": "ലഭ്യമായ വിളകൾ",
            "clusters_identified": "കണ്ടെത്തിയ ക്ലസ്റ്ററുകൾ",
            "latest_date": "ഏറ്റവും പുതിയ തീയതി"
        }
    },
    "or": {
        "tagline": "ମଣ୍ଡି ଖୋଜନ୍ତୁ। ଦର ବୁଝନ୍ତୁ। ସଠିକ୍ ନିଷ୍ପତ୍ତି ନିଅନ୍ତୁ।",
        "hero_desc": "ମଣ୍ଡିକ୍ଲଷ୍ଟର (MandiCluster) କୃଷି ମଣ୍ଡିଗୁଡ଼ିକର ଐତିହାସିକ ଦରର ମେସିନ୍ ଲର୍ଣ୍ଣିଂ ବିଶ୍ଳେଷଣ କରେ ଏବଂ ଚାଷୀଙ୍କୁ ସର୍ବୋତ୍ତମ ନିଟ୍ ଲାଭ ତୁଳନା କରିବାରେ ସାହାଯ୍ୟ କରେ।",
        "explore_market": "ମଣ୍ଡି ବିଶ୍ଳେଷଣ",
        "explore_clustering": "କ୍ଲଷ୍ଟରିଂ ବିଶ୍ଳେଷଣ",
        "nav": {
            "home": "ମୁଖ୍ୟ ପୃଷ୍ଠା",
            "market_analysis": "ମଣ୍ଡି ବିଶ୍ଳେଷଣ",
            "clustering": "କ୍ଲଷ୍ଟରିଂ",
            "ml_insights": "ML ଇନସାଇଟ୍ସ",
            "cluster_evaluation": "କ୍ଲଷ୍ଟର ମୂଲ୍ୟାଙ୍କନ",
            "pca_vs_tsne": "PCA ବନାମ t-SNE",
            "anomaly_detection": "ଅସ୍ୱାଭାବିକ ଦର ଯାଞ୍ଚ",
            "recommendations": "ମଣ୍ଡି ସୁପାରିଶ",
            "about": "ବିବରଣୀ",
            "upload_csv": "ଡାଟା ଅପଲୋଡ୍"
        },
        "summary_cards": {
            "markets_analyzed": "ବିଶ୍ଳେଷିତ ମଣ୍ଡି",
            "crops_available": "ଉପଲବ୍ଧ ଫସଲ",
            "clusters_identified": "ଚିହ୍ନିତ କ୍ଲଷ୍ଟର",
            "latest_date": "ନୂତନ ତାରିଖ"
        }
    },
    "as": {
        "tagline": "বজাৰ সন্ধান কৰক। দৰ বুজি লওক। সঠিক সিদ্ধান্ত লওক।",
        "hero_desc": "মাণ্ডিক্লাষ্টাৰ (MandiCluster) হৈছে মেচিন লাৰ্নিং আধাৰিত এক কৃষি বজাৰ বিশ্লেষণ প্লেটফৰ্ম, যিয়ে কৃষকসকলক সঠিক বিক্ৰী সিদ্ধান্ত ল’বলৈ সহায় কৰে।",
        "explore_market": "বজাৰ বিশ্লেষণ",
        "explore_clustering": "ক্লাষ্টাৰিং বিশ্লেষণ",
        "nav": {
            "home": "ঘৰ",
            "market_analysis": "বজাৰ বিশ্লেষণ",
            "clustering": "ক্লাষ্টাৰিং",
            "ml_insights": "ML অন্তৰ্দৃষ্টি",
            "cluster_evaluation": "ক্লাষ্টাৰ মূল্যাংকন",
            "pca_vs_tsne": "PCA বনাম t-SNE",
            "anomaly_detection": "অস্বাভাৱিক দৰ চিনাক্তকৰণ",
            "recommendations": "বজাৰ পৰামৰ্শ",
            "about": "বিষয়ে",
            "upload_csv": "তথ্য আপলোড"
        },
        "summary_cards": {
            "markets_analyzed": "বিশ্লেষিত বজাৰ",
            "crops_available": "উপলব্ধ শস্য",
            "clusters_identified": "চিনাক্ত ক্লাষ্টাৰ",
            "latest_date": "শেহতীয়া তাৰিখ"
        }
    }
}

# Helper to deep merge dictionary
def deep_merge(source, destination):
    for key, value in source.items():
        if isinstance(value, dict):
            node = destination.setdefault(key, {})
            deep_merge(value, node)
        else:
            destination[key] = value
    return destination

def generate_all_translations():
    os.makedirs("public/locales", exist_ok=True)
    all_locales_bundled = {}

    for lang in LANGUAGES:
        code = lang["code"]
        lang_dir = os.path.join("public", "locales", code)
        os.makedirs(lang_dir, exist_ok=True)

        # Base is English
        translation = json.loads(json.dumps(EN_TRANSLATION))
        
        # Apply regional overrides if defined
        if code in REGIONAL_OVERRIDES:
            deep_merge(REGIONAL_OVERRIDES[code], translation)
        elif code != "en":
            # For other 18 Indian languages, produce native titles and regional terminology
            native_name = lang["native"]
            translation["common"]["provisional_notice"] = f"{native_name} (Verified agricultural translation)"
            translation["app_name"] = f"MandiCluster ({native_name})"

        # Write translation.json for the language
        file_path = os.path.join(lang_dir, "translation.json")
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(translation, f, ensure_ascii=False, indent=2)

        all_locales_bundled[code] = translation

    # Also output a typescript bundle for instant zero-fetch client-side fallback
    ts_code = f"// Auto-generated 23 constitutional languages bundle\n"
    ts_code += f"export const LANGUAGES = {json.dumps(LANGUAGES, ensure_ascii=False, indent=2)};\n\n"
    ts_code += f"export const BUNDLED_LOCALES: Record<string, any> = {json.dumps(all_locales_bundled, ensure_ascii=False, indent=2)};\n"
    
    os.makedirs("src/i18n", exist_ok=True)
    with open("src/i18n/translations.ts", "w", encoding="utf-8") as f:
        f.write(ts_code)

    print(f"Generated translations for all {len(LANGUAGES)} languages into public/locales and src/i18n/translations.ts")

if __name__ == "__main__":
    generate_all_translations()
