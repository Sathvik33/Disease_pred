export interface DiseaseEntry {
    plant: string;
    name: string;
    desc: string;
    causes: string;
    symptoms: string[];
    severity: string;
    conditions: string;
    treatments: {
        chemical: string[];
        organic: string[];
        cultural: string[];
    };
    precautions: string[];
}

export const diseaseDB: Record<string, DiseaseEntry> = {
    "Apple___Apple_scab": {
        plant: "Apple",
        name: "Apple Scab",
        desc: "Fungal disease causing olive-green to black lesions on leaves and fruit",
        causes: "Venturia inaequalis fungus, spreads through wind and rain splash",
        symptoms: ["olive-green spots on leaves", "dark scabby lesions on fruit", "premature leaf drop", "distorted fruit"],
        severity: "moderate",
        conditions: "cool moist spring weather, 55-75°F with prolonged leaf wetness",
        treatments: {
            chemical: ["Captan", "Myclobutanil", "Mancozeb"],
            organic: ["Sulfur spray", "Neem oil", "Copper fungicide"],
            cultural: ["rake and destroy fallen leaves", "prune for air circulation", "plant resistant varieties"]
        },
        precautions: ["apply fungicide before rain events", "avoid overhead irrigation", "maintain tree spacing"]
    },
    "Apple___Black_rot": {
        plant: "Apple",
        name: "Black Rot",
        desc: "Fungal disease causing fruit rot and leaf spots with frog-eye pattern",
        causes: "Botryosphaeria obtusa fungus, overwinters in mummified fruit and dead bark",
        symptoms: ["frog-eye leaf spots", "brown to black fruit rot", "cankers on branches", "mummified fruit"],
        severity: "high",
        conditions: "warm humid weather, 60-90°F with high humidity",
        treatments: {
            chemical: ["Captan", "Thiophanate-methyl", "Strobilurin fungicides"],
            organic: ["Copper hydroxide", "Neem oil"],
            cultural: ["remove mummified fruit", "prune dead branches", "maintain orchard sanitation"]
        },
        precautions: ["remove all infected material from orchard", "avoid wounding trees", "apply protectant fungicides during bloom"]
    },
    "Apple___Cedar_apple_rust": {
        plant: "Apple",
        name: "Cedar Apple Rust",
        desc: "Fungal disease requiring two hosts, causes bright orange spots on apple leaves",
        causes: "Gymnosporangium juniperi-virginianae, needs both cedar and apple hosts",
        symptoms: ["bright orange spots on upper leaf surface", "tube-like structures on leaf undersides", "deformed fruit", "premature leaf drop"],
        severity: "moderate",
        conditions: "warm rainy spring, spores release during rain at 50-75°F",
        treatments: {
            chemical: ["Myclobutanil", "Propiconazole", "Triadimefon"],
            organic: ["Sulfur spray", "Copper fungicide"],
            cultural: ["remove nearby cedar trees", "plant resistant apple varieties", "improve air circulation"]
        },
        precautions: ["scout for galls on cedars in spring", "apply fungicide at pink bud stage", "remove galls before they produce spores"]
    },
    "Apple___healthy": {
        plant: "Apple",
        name: "Healthy",
        desc: "No disease detected, plant appears healthy",
        causes: "N/A",
        symptoms: [],
        severity: "none",
        conditions: "N/A",
        treatments: { chemical: [], organic: [], cultural: ["maintain regular watering", "proper fertilization", "annual pruning"] },
        precautions: ["continue regular monitoring", "maintain good orchard hygiene", "ensure proper nutrition"]
    },
    "Blueberry___healthy": {
        plant: "Blueberry",
        name: "Healthy",
        desc: "No disease detected, plant appears healthy",
        causes: "N/A",
        symptoms: [],
        severity: "none",
        conditions: "N/A",
        treatments: { chemical: [], organic: [], cultural: ["maintain acidic soil pH 4.5-5.5", "mulch around base", "proper pruning"] },
        precautions: ["monitor soil pH regularly", "ensure adequate drainage", "protect from birds"]
    },
    "Cherry_(including_sour)___Powdery_mildew": {
        plant: "Cherry",
        name: "Powdery Mildew",
        desc: "Fungal disease causing white powdery coating on leaves and shoots",
        causes: "Podosphaera clandestina fungus, spreads by wind",
        symptoms: ["white powdery patches on leaves", "curled distorted leaves", "stunted shoot growth", "reduced fruit quality"],
        severity: "moderate",
        conditions: "warm dry days with cool humid nights, 60-80°F",
        treatments: {
            chemical: ["Myclobutanil", "Trifloxystrobin", "Sulfur"],
            organic: ["Potassium bicarbonate", "Neem oil", "Sulfur dust"],
            cultural: ["prune for air circulation", "avoid excessive nitrogen", "remove infected shoots"]
        },
        precautions: ["apply fungicide at first sign", "avoid overhead watering", "space trees properly"]
    },
    "Cherry_(including_sour)___healthy": {
        plant: "Cherry",
        name: "Healthy",
        desc: "No disease detected, plant appears healthy",
        causes: "N/A",
        symptoms: [],
        severity: "none",
        conditions: "N/A",
        treatments: { chemical: [], organic: [], cultural: ["regular pruning", "adequate watering", "balanced fertilization"] },
        precautions: ["monitor for early signs of disease", "maintain tree vigor", "proper winter care"]
    },
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": {
        plant: "Corn",
        name: "Gray Leaf Spot",
        desc: "Fungal disease causing rectangular gray lesions between leaf veins",
        causes: "Cercospora zeae-maydis, survives in crop residue",
        symptoms: ["rectangular gray-brown lesions", "lesions parallel to leaf veins", "lower leaves affected first", "severe cases cause premature death"],
        severity: "high",
        conditions: "warm humid weather, 75-85°F with prolonged dew periods and high humidity",
        treatments: {
            chemical: ["Azoxystrobin", "Pyraclostrobin", "Propiconazole"],
            organic: ["Crop rotation", "Resistant hybrids"],
            cultural: ["rotate with non-host crops", "tillage to bury residue", "plant resistant hybrids"]
        },
        precautions: ["scout fields regularly from tasseling", "avoid continuous corn planting", "consider fungicide at VT-R1 stage"]
    },
    "Corn_(maize)___Common_rust_": {
        plant: "Corn",
        name: "Common Rust",
        desc: "Fungal disease causing reddish-brown pustules on both leaf surfaces",
        causes: "Puccinia sorghi, spores carried by wind from southern regions",
        symptoms: ["small reddish-brown pustules on leaves", "pustules on both leaf surfaces", "chlorotic halos around pustules", "premature leaf senescence"],
        severity: "moderate",
        conditions: "cool to moderate temperatures 60-77°F with high humidity and heavy dew",
        treatments: {
            chemical: ["Azoxystrobin", "Propiconazole", "Trifloxystrobin"],
            organic: ["Plant resistant hybrids"],
            cultural: ["plant resistant hybrids", "early planting date", "balanced fertility"]
        },
        precautions: ["scout before tasseling", "consider fungicide if pustules appear before tasseling", "avoid late planting"]
    },
    "Corn_(maize)___Northern_Leaf_Blight": {
        plant: "Corn",
        name: "Northern Leaf Blight",
        desc: "Fungal disease causing long cigar-shaped gray-green lesions",
        causes: "Exserohilum turcicum, survives in crop debris",
        symptoms: ["cigar-shaped gray-green lesions 1-6 inches", "lesions start on lower leaves", "dark spore production on lesions", "can cause significant yield loss"],
        severity: "high",
        conditions: "moderate temperatures 65-80°F with heavy dew and frequent rain",
        treatments: {
            chemical: ["Azoxystrobin", "Propiconazole", "Picoxystrobin"],
            organic: ["Resistant hybrids"],
            cultural: ["crop rotation", "tillage to decompose residue", "plant resistant hybrids"]
        },
        precautions: ["apply fungicide before disease reaches ear leaf", "rotate away from corn", "use Ht-resistant hybrids"]
    },
    "Corn_(maize)___healthy": {
        plant: "Corn",
        name: "Healthy",
        desc: "No disease detected, plant appears healthy",
        causes: "N/A",
        symptoms: [],
        severity: "none",
        conditions: "N/A",
        treatments: { chemical: [], organic: [], cultural: ["proper spacing", "adequate nitrogen", "weed management"] },
        precautions: ["continue scouting", "maintain soil health", "plan crop rotation"]
    },
    "Grape___Black_rot": {
        plant: "Grape",
        name: "Black Rot",
        desc: "Fungal disease causing brown leaf spots and shriveled black mummified fruit",
        causes: "Guignardia bidwellii, overwinters in mummified berries and infected canes",
        symptoms: ["tan to brown leaf spots with dark borders", "black shriveled mummified berries", "dark lesions on shoots", "rapid fruit destruction"],
        severity: "high",
        conditions: "warm wet weather, 60-90°F with rain or heavy dew for 6+ hours",
        treatments: {
            chemical: ["Myclobutanil", "Mancozeb", "Captan"],
            organic: ["Copper fungicide", "Sulfur"],
            cultural: ["remove mummified fruit", "prune for air circulation", "maintain canopy management"]
        },
        precautions: ["apply fungicide from bud break through veraison", "remove all mummies and infected debris", "open canopy for air flow"]
    },
    "Grape___Esca_(Black_Measles)": {
        plant: "Grape",
        name: "Esca (Black Measles)",
        desc: "Complex wood disease causing tiger-stripe leaf symptoms and dark berry spots",
        causes: "Complex of fungi including Phaeomoniella and Phaeoacremonium species, enters through pruning wounds",
        symptoms: ["tiger-stripe pattern on leaves", "dark spots on berries", "interveinal chlorosis and necrosis", "sudden vine collapse in severe cases"],
        severity: "high",
        conditions: "drought stress followed by wet conditions, mature vines most susceptible",
        treatments: {
            chemical: ["No effective chemical cure", "Thiophanate-methyl on pruning wounds"],
            organic: ["Trichoderma-based biocontrols on pruning wounds"],
            cultural: ["delayed pruning", "double pruning technique", "protect pruning wounds", "remove severely affected vines"]
        },
        precautions: ["prune during dry weather", "seal large pruning wounds", "avoid pruning during rain", "maintain vine vigor"]
    },
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": {
        plant: "Grape",
        name: "Leaf Blight (Isariopsis Leaf Spot)",
        desc: "Fungal disease causing angular brown spots on grape leaves",
        causes: "Pseudocercospora vitis, favored by warm humid conditions",
        symptoms: ["angular brown spots on leaves", "dark margins on lesions", "premature defoliation", "reduced vine vigor"],
        severity: "moderate",
        conditions: "warm humid weather with frequent rainfall",
        treatments: {
            chemical: ["Mancozeb", "Copper oxychloride", "Carbendazim"],
            organic: ["Bordeaux mixture", "Copper hydroxide"],
            cultural: ["improve air circulation", "remove fallen leaves", "avoid overhead irrigation"]
        },
        precautions: ["spray preventively during wet season", "maintain canopy openness", "ensure good drainage"]
    },
    "Grape___healthy": {
        plant: "Grape",
        name: "Healthy",
        desc: "No disease detected, plant appears healthy",
        causes: "N/A",
        symptoms: [],
        severity: "none",
        conditions: "N/A",
        treatments: { chemical: [], organic: [], cultural: ["proper trellising", "balanced pruning", "regular monitoring"] },
        precautions: ["maintain canopy management", "monitor for pests", "ensure proper nutrition"]
    },
    "Orange___Haunglongbing_(Citrus_greening)": {
        plant: "Orange",
        name: "Huanglongbing (Citrus Greening)",
        desc: "Devastating bacterial disease causing yellowing, misshapen fruit, and tree decline",
        causes: "Candidatus Liberibacter asiaticus, spread by Asian citrus psyllid",
        symptoms: ["asymmetric blotchy leaf yellowing", "small lopsided bitter fruit", "green fruit at maturity", "twig dieback", "overall tree decline"],
        severity: "critical",
        conditions: "any climate where citrus psyllid is present, year-round in tropical regions",
        treatments: {
            chemical: ["Imidacloprid for psyllid control", "Dimethoate", "No cure for infected trees"],
            organic: ["Kaolin clay for psyllid deterrent", "Release Tamarixia radiata parasitoid"],
            cultural: ["remove infected trees", "control psyllid populations", "use certified disease-free nursery stock"]
        },
        precautions: ["inspect new plantings carefully", "manage psyllid populations aggressively", "report suspected infections to authorities", "no cure exists - prevention is critical"]
    },
    "Peach___Bacterial_spot": {
        plant: "Peach",
        name: "Bacterial Spot",
        desc: "Bacterial disease causing angular leaf spots and fruit lesions",
        causes: "Xanthomonas arboricola pv. pruni, spreads through rain splash and wind",
        symptoms: ["angular water-soaked leaf spots", "shot-hole appearance on leaves", "shallow pitted fruit lesions", "twig cankers"],
        severity: "moderate",
        conditions: "warm wet weather, 75-86°F with wind-driven rain",
        treatments: {
            chemical: ["Copper hydroxide (dormant season)", "Oxytetracycline"],
            organic: ["Copper fungicide at leaf fall", "Bacillus-based products"],
            cultural: ["plant resistant varieties", "avoid overhead irrigation", "proper tree spacing"]
        },
        precautions: ["apply copper at leaf fall and before bud break", "avoid working with wet trees", "choose resistant cultivars"]
    },
    "Peach___healthy": {
        plant: "Peach",
        name: "Healthy",
        desc: "No disease detected, plant appears healthy",
        causes: "N/A",
        symptoms: [],
        severity: "none",
        conditions: "N/A",
        treatments: { chemical: [], organic: [], cultural: ["regular pruning", "proper thinning", "adequate watering"] },
        precautions: ["monitor for borers", "maintain tree health", "practice good sanitation"]
    },
    "Pepper,_bell___Bacterial_spot": {
        plant: "Pepper",
        name: "Bacterial Spot",
        desc: "Bacterial disease causing raised spots on leaves, stems, and fruit",
        causes: "Xanthomonas campestris pv. vesicatoria, seed-borne and spread by rain",
        symptoms: ["small water-soaked leaf spots", "raised scab-like fruit spots", "leaf yellowing and drop", "stem lesions"],
        severity: "high",
        conditions: "warm humid weather, 75-86°F with frequent rain or overhead irrigation",
        treatments: {
            chemical: ["Copper hydroxide + Mancozeb", "Acibenzolar-S-methyl"],
            organic: ["Copper-based sprays", "Bacillus subtilis"],
            cultural: ["use disease-free seed", "crop rotation 2-3 years", "avoid overhead irrigation", "remove infected plants"]
        },
        precautions: ["use hot water seed treatment", "don't work in wet fields", "disinfect tools between plants"]
    },
    "Pepper,_bell___healthy": {
        plant: "Pepper",
        name: "Healthy",
        desc: "No disease detected, plant appears healthy",
        causes: "N/A",
        symptoms: [],
        severity: "none",
        conditions: "N/A",
        treatments: { chemical: [], organic: [], cultural: ["proper staking", "consistent watering", "balanced fertilization"] },
        precautions: ["monitor for pests", "maintain soil moisture", "avoid blossom end rot with calcium"]
    },
    "Potato___Early_blight": {
        plant: "Potato",
        name: "Early Blight",
        desc: "Fungal disease causing concentric ring target-like spots on lower leaves",
        causes: "Alternaria solani, survives in soil and plant debris",
        symptoms: ["dark brown target-shaped spots on lower leaves", "concentric rings in lesions", "yellowing around lesions", "premature defoliation", "tuber lesions"],
        severity: "moderate",
        conditions: "warm weather 75-84°F alternating wet and dry periods, stressed plants",
        treatments: {
            chemical: ["Chlorothalonil", "Mancozeb", "Azoxystrobin"],
            organic: ["Copper fungicide", "Bacillus subtilis", "Neem oil"],
            cultural: ["crop rotation 3+ years", "adequate fertilization", "remove plant debris", "proper hilling"]
        },
        precautions: ["begin spraying before symptoms appear", "maintain plant vigor", "harvest mature tubers promptly"]
    },
    "Potato___Late_blight": {
        plant: "Potato",
        name: "Late Blight",
        desc: "Devastating oomycete disease causing rapid foliage death and tuber rot",
        causes: "Phytophthora infestans, spreads rapidly in cool wet conditions",
        symptoms: ["water-soaked dark lesions on leaves", "white mold on leaf undersides", "rapid foliage collapse", "firm reddish-brown tuber rot"],
        severity: "critical",
        conditions: "cool wet weather 50-70°F, prolonged humidity above 90%, fog or heavy dew",
        treatments: {
            chemical: ["Chlorothalonil", "Mancozeb", "Metalaxyl-M + Mancozeb", "Cymoxanil"],
            organic: ["Copper hydroxide", "Bacillus subtilis"],
            cultural: ["destroy volunteer potatoes", "plant certified seed", "improve drainage", "hill tubers well"]
        },
        precautions: ["apply preventive fungicide in wet weather", "destroy all cull piles", "monitor weather forecasts for blight conditions", "kill vines before harvest if infected"]
    },
    "Potato___healthy": {
        plant: "Potato",
        name: "Healthy",
        desc: "No disease detected, plant appears healthy",
        causes: "N/A",
        symptoms: [],
        severity: "none",
        conditions: "N/A",
        treatments: { chemical: [], organic: [], cultural: ["proper hilling", "consistent irrigation", "balanced fertility"] },
        precautions: ["continue scouting", "use certified seed", "plan crop rotation"]
    },
    "Raspberry___healthy": {
        plant: "Raspberry",
        name: "Healthy",
        desc: "No disease detected, plant appears healthy",
        causes: "N/A",
        symptoms: [],
        severity: "none",
        conditions: "N/A",
        treatments: { chemical: [], organic: [], cultural: ["annual cane pruning", "proper trellising", "mulching"] },
        precautions: ["remove spent floricanes", "monitor for cane borers", "ensure good air flow"]
    },
    "Soybean___healthy": {
        plant: "Soybean",
        name: "Healthy",
        desc: "No disease detected, plant appears healthy",
        causes: "N/A",
        symptoms: [],
        severity: "none",
        conditions: "N/A",
        treatments: { chemical: [], organic: [], cultural: ["proper inoculation", "weed management", "crop rotation"] },
        precautions: ["scout for sudden death syndrome", "monitor for aphids", "plan rotations"]
    },
    "Squash___Powdery_mildew": {
        plant: "Squash",
        name: "Powdery Mildew",
        desc: "Fungal disease causing white powdery coating on leaf surfaces",
        causes: "Podosphaera xanthii and Erysiphe cichoracearum, spread by wind",
        symptoms: ["white powdery spots on upper leaf surface", "yellowing leaves", "premature leaf death", "reduced fruit size"],
        severity: "moderate",
        conditions: "warm dry days 68-81°F with cool humid nights, shaded dense canopy",
        treatments: {
            chemical: ["Myclobutanil", "Chlorothalonil", "Sulfur"],
            organic: ["Potassium bicarbonate", "Neem oil", "Milk spray 40% solution"],
            cultural: ["plant resistant varieties", "increase plant spacing", "avoid excess nitrogen"]
        },
        precautions: ["apply at first sign of white spots", "spray leaf undersides too", "rotate fungicide modes of action"]
    },
    "Strawberry___Leaf_scorch": {
        plant: "Strawberry",
        name: "Leaf Scorch",
        desc: "Fungal disease causing purple spots that enlarge and dry out leaves",
        causes: "Diplocarpon earlianum, overwinters in infected leaves",
        symptoms: ["small irregular purple spots on leaves", "spots merge causing scorched appearance", "affected leaves dry and curl", "reduced plant vigor"],
        severity: "moderate",
        conditions: "warm wet weather, splashing rain, dense plantings",
        treatments: {
            chemical: ["Captan", "Myclobutanil", "Azoxystrobin"],
            organic: ["Copper fungicide", "Neem oil"],
            cultural: ["remove old infected leaves", "renovate beds after harvest", "improve air circulation", "proper plant spacing"]
        },
        precautions: ["apply fungicide during bloom", "avoid overhead irrigation", "use drip irrigation", "plant resistant varieties"]
    },
    "Strawberry___healthy": {
        plant: "Strawberry",
        name: "Healthy",
        desc: "No disease detected, plant appears healthy",
        causes: "N/A",
        symptoms: [],
        severity: "none",
        conditions: "N/A",
        treatments: { chemical: [], organic: [], cultural: ["runner management", "straw mulching", "renovation after harvest"] },
        precautions: ["monitor for spider mites", "maintain proper soil pH", "replace plants every 3-4 years"]
    },
    "Tomato___Bacterial_spot": {
        plant: "Tomato",
        name: "Bacterial Spot",
        desc: "Bacterial disease causing small dark raised spots on leaves and fruit",
        causes: "Xanthomonas species, seed-borne and spread by rain splash",
        symptoms: ["small dark greasy spots on leaves", "spots with yellow halos", "raised scab-like fruit lesions", "defoliation in severe cases"],
        severity: "high",
        conditions: "warm wet weather 75-86°F, wind-driven rain, overhead irrigation",
        treatments: {
            chemical: ["Copper hydroxide + Mancozeb", "Acibenzolar-S-methyl"],
            organic: ["Copper-based sprays", "Bacillus subtilis products"],
            cultural: ["use pathogen-free seed and transplants", "crop rotation 2+ years", "avoid overhead watering"]
        },
        precautions: ["don't work with wet plants", "disinfect stakes and tools", "remove severely infected plants"]
    },
    "Tomato___Early_blight": {
        plant: "Tomato",
        name: "Early Blight",
        desc: "Fungal disease causing target-like concentric ring spots on lower leaves",
        causes: "Alternaria solani, survives in soil and crop debris for years",
        symptoms: ["dark brown spots with concentric rings on lower leaves", "yellowing around lesions", "progressive defoliation upward", "stem and fruit lesions possible"],
        severity: "moderate",
        conditions: "warm wet weather 75-84°F, heavy dew, stressed or poorly nourished plants",
        treatments: {
            chemical: ["Chlorothalonil", "Mancozeb", "Azoxystrobin"],
            organic: ["Copper fungicide", "Bacillus amyloliquefaciens", "Neem oil"],
            cultural: ["mulch around base", "stake plants for air flow", "remove lower infected leaves", "crop rotation"]
        },
        precautions: ["begin fungicide applications early", "water at base of plant", "ensure adequate nutrition especially calcium"]
    },
    "Tomato___Late_blight": {
        plant: "Tomato",
        name: "Late Blight",
        desc: "Devastating oomycete disease causing rapid plant death in cool wet conditions",
        causes: "Phytophthora infestans, spreads extremely rapidly via wind-borne sporangia",
        symptoms: ["large dark water-soaked lesions on leaves", "white fuzzy mold on undersides in humid conditions", "dark greasy stem lesions", "firm brown fruit rot"],
        severity: "critical",
        conditions: "cool wet weather 50-70°F, humidity above 90%, prolonged leaf wetness",
        treatments: {
            chemical: ["Chlorothalonil", "Mancozeb", "Metalaxyl-M", "Cymoxanil + Mancozeb"],
            organic: ["Copper hydroxide", "Bacillus subtilis"],
            cultural: ["destroy infected plants immediately", "improve air circulation", "avoid overhead irrigation", "use resistant varieties"]
        },
        precautions: ["monitor weather forecasts constantly", "spray preventively in wet weather", "act immediately at first sign", "remove and bag infected material - do not compost"]
    },
    "Tomato___Leaf_Mold": {
        plant: "Tomato",
        name: "Leaf Mold",
        desc: "Fungal disease causing yellow spots on upper leaf surface and olive mold beneath",
        causes: "Passalora fulva (Cladosporium fulvum), favored by high humidity in greenhouses",
        symptoms: ["pale green to yellow spots on upper leaf surface", "olive-green to brown velvety mold on leaf undersides", "leaves curl and drop", "mainly affects greenhouse tomatoes"],
        severity: "moderate",
        conditions: "high humidity above 85%, moderate temperatures 72-75°F, poor ventilation",
        treatments: {
            chemical: ["Chlorothalonil", "Mancozeb", "Copper fungicides"],
            organic: ["Improve ventilation", "Bacillus-based products"],
            cultural: ["increase greenhouse ventilation", "reduce humidity below 85%", "space plants wider", "remove infected leaves"]
        },
        precautions: ["ensure good air flow in greenhouse", "avoid leaf wetting", "use resistant varieties when available"]
    },
    "Tomato___Septoria_leaf_spot": {
        plant: "Tomato",
        name: "Septoria Leaf Spot",
        desc: "Fungal disease causing numerous small circular spots with dark borders and gray centers",
        causes: "Septoria lycopersici, survives on infected debris and solanaceous weeds",
        symptoms: ["many small circular spots with dark borders", "gray to tan centers with tiny dark specks", "starts on lower leaves progressing upward", "severe defoliation"],
        severity: "moderate",
        conditions: "warm wet weather 68-77°F, prolonged leaf wetness, splashing rain",
        treatments: {
            chemical: ["Chlorothalonil", "Mancozeb", "Azoxystrobin"],
            organic: ["Copper fungicide", "Bacillus subtilis"],
            cultural: ["mulch to prevent soil splash", "stake plants", "remove lower infected leaves", "crop rotation"]
        },
        precautions: ["begin spraying at first fruit set", "water at soil level", "control solanaceous weeds nearby"]
    },
    "Tomato___Spider_mites Two-spotted_spider_mite": {
        plant: "Tomato",
        name: "Spider Mites (Two-spotted)",
        desc: "Tiny arachnids causing stippled yellowing leaves and fine webbing",
        causes: "Tetranychus urticae, thrives in hot dry conditions, reproduces rapidly",
        symptoms: ["tiny yellow stippling on leaves", "fine webbing on leaf undersides", "bronzed or bleached leaves", "severe infestations cause leaf drop and plant death"],
        severity: "high",
        conditions: "hot dry weather above 80°F, low humidity, dusty conditions",
        treatments: {
            chemical: ["Abamectin", "Bifenthrin", "Spiromesifen"],
            organic: ["Insecticidal soap", "Neem oil", "Predatory mites (Phytoseiulus persimilis)"],
            cultural: ["increase humidity around plants", "wash plants with strong water spray", "avoid broad-spectrum insecticides that kill predators"]
        },
        precautions: ["rotate miticides to prevent resistance", "introduce predatory mites early", "avoid dusty conditions around plants"]
    },
    "Tomato___Target_Spot": {
        plant: "Tomato",
        name: "Target Spot",
        desc: "Fungal disease causing brown target-like spots on leaves, stems, and fruit",
        causes: "Corynespora cassiicola, survives in crop debris and alternate hosts",
        symptoms: ["brown spots with concentric rings on leaves", "lesions on stems and petioles", "sunken spots on fruit", "progressive defoliation"],
        severity: "moderate",
        conditions: "warm humid weather 68-86°F with frequent rain and poor air circulation",
        treatments: {
            chemical: ["Chlorothalonil", "Azoxystrobin", "Difenoconazole"],
            organic: ["Copper fungicide", "Bacillus-based biofungicides"],
            cultural: ["stake and prune for air flow", "mulch to reduce splash", "rotate with non-solanaceous crops"]
        },
        precautions: ["apply fungicide preventively in wet seasons", "remove lower infected foliage", "maintain good field sanitation"]
    },
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus": {
        plant: "Tomato",
        name: "Yellow Leaf Curl Virus (TYLCV)",
        desc: "Devastating viral disease causing severe leaf curling, yellowing, and stunting",
        causes: "Begomovirus transmitted by whiteflies (Bemisia tabaci), not seed-borne",
        symptoms: ["severe upward leaf curling", "leaf yellowing and reduced size", "stunted plant growth", "flower drop and poor fruit set"],
        severity: "critical",
        conditions: "warm weather with high whitefly populations, no cure once infected",
        treatments: {
            chemical: ["Imidacloprid for whitefly control", "Cyantraniliprole", "Spiromesifen"],
            organic: ["Yellow sticky traps", "Neem oil for whitefly deterrent", "Reflective mulches"],
            cultural: ["remove infected plants immediately", "control whitefly populations", "use virus-resistant varieties", "install insect screens in greenhouses"]
        },
        precautions: ["manage whiteflies aggressively", "use resistant varieties when available", "remove and destroy infected plants promptly", "avoid planting near infected fields"]
    },
    "Tomato___Tomato_mosaic_virus": {
        plant: "Tomato",
        name: "Tomato Mosaic Virus (ToMV)",
        desc: "Highly contagious viral disease causing mottled mosaic pattern on leaves",
        causes: "Tobamovirus, extremely stable virus spread by mechanical contact, seed, and contaminated tools",
        symptoms: ["light and dark green mosaic pattern on leaves", "leaf distortion and fernleaf symptoms", "reduced fruit set", "uneven fruit ripening with internal browning"],
        severity: "high",
        conditions: "spreads easily through handling, tools, and seed - not insect transmitted",
        treatments: {
            chemical: ["No chemical cure for viral diseases"],
            organic: ["Milk spray (20% solution) as disinfectant on hands and tools"],
            cultural: ["use virus-free seed", "disinfect tools with 10% bleach", "wash hands with milk before handling plants", "remove and destroy infected plants"]
        },
        precautions: ["never smoke near tomato plants (tobacco mosaic cross-contamination)", "sanitize tools between plants", "use resistant varieties", "avoid handling plants when wet"]
    },
    "Tomato___healthy": {
        plant: "Tomato",
        name: "Healthy",
        desc: "No disease detected, plant appears healthy",
        causes: "N/A",
        symptoms: [],
        severity: "none",
        conditions: "N/A",
        treatments: { chemical: [], organic: [], cultural: ["regular pruning of suckers", "consistent deep watering", "calcium-rich fertilization"] },
        precautions: ["stake or cage plants", "mulch around base", "rotate planting location yearly"]
    }
};
