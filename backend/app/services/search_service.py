import logging
import httpx
from typing import List, Dict, Any, Optional

logger = logging.getLogger("satquery.search")

# 50+ Curated Global Environmental & Infrastructural Change Hotspots
GLOBAL_HOTSPOTS: List[Dict[str, Any]] = [
    {
        "id": "aral-sea",
        "name": "Aral Sea Desiccation",
        "lat": 45.0,
        "lng": 60.0,
        "zoom": 8,
        "default_index": "NDWI",
        "default_years": [2016, 2026],
        "preview_delta": "-48.2% Surface Water",
        "category": "Water Retreat",
        "description": "Catastrophic shrinkage of the Aral Sea due to river diversion for cotton irrigation, exposing toxic salt flats.",
        "bbox": [58.5, 43.8, 61.5, 46.2]
    },
    {
        "id": "amazon-rondonia",
        "name": "Rondônia Fishbone Deforestation, Brazil",
        "lat": -10.8,
        "lng": -62.5,
        "zoom": 9,
        "default_index": "NDVI",
        "default_years": [2016, 2026],
        "preview_delta": "-34.6% Forest Canopy",
        "category": "Deforestation",
        "description": "Systematic orthogonal road logging creating extensive fishbone clear-cuts for cattle ranching.",
        "bbox": [-63.2, -11.5, -61.8, -10.1]
    },
    {
        "id": "dubai-coast",
        "name": "Dubai Waterfront & Palm Reclamation, UAE",
        "lat": 25.13,
        "lng": 55.15,
        "zoom": 11,
        "default_index": "NDBI",
        "default_years": [2016, 2026],
        "preview_delta": "+41.8% Built-Up Infrastructure",
        "category": "Coastal Reclamation",
        "description": "Massive marine dredging and artificial island archipelago engineering along the Arabian Gulf.",
        "bbox": [55.0, 25.0, 55.3, 25.3]
    },
    {
        "id": "oragadam-corridor",
        "name": "Oragadam Industrial Corridor, Chennai, India",
        "lat": 12.83,
        "lng": 79.95,
        "zoom": 12,
        "default_index": "NDBI",
        "default_years": [2016, 2026],
        "preview_delta": "+52.3% Industrial Footprint",
        "category": "Industrial Growth",
        "description": "Rapid transformation of rural scrubland into South Asia's leading automotive manufacturing hub.",
        "bbox": [79.85, 12.75, 80.05, 12.92]
    },
    {
        "id": "lake-mead",
        "name": "Lake Mead Reservoir Drop, Nevada/Arizona",
        "lat": 36.14,
        "lng": -114.45,
        "zoom": 10,
        "default_index": "NDWI",
        "default_years": [2016, 2026],
        "preview_delta": "-31.4% Water Surface",
        "category": "Drought & Water Loss",
        "description": "Colorado River drought causing critical bathtub-ring shoreline recession.",
        "bbox": [-114.8, 35.9, -114.2, 36.4]
    },
    {
        "id": "ilulissat-glacier",
        "name": "Ilulissat Icefjord Glacier Retreat, Greenland",
        "lat": 69.17,
        "lng": -49.85,
        "zoom": 9,
        "default_index": "SAR",
        "default_years": [2016, 2026],
        "preview_delta": "-26.7% Ice Shelf Extent",
        "category": "Glacier Loss",
        "description": "Accelerating calving front retreat of the Jakobshavn Isbræ ice stream.",
        "bbox": [-50.5, 69.0, -49.2, 69.35]
    },
    {
        "id": "atacama-lithium",
        "name": "Salar de Atacama Lithium Evaporation Pools, Chile",
        "lat": -23.50,
        "lng": -68.35,
        "zoom": 11,
        "default_index": "NDWI",
        "default_years": [2016, 2026],
        "preview_delta": "+63.1% Evaporite Basin Expansion",
        "category": "Industrial Mining",
        "description": "Massive brine extraction ponds yielding battery-grade lithium carbonate.",
        "bbox": [-68.5, -23.7, -68.2, -23.3]
    },
    {
        "id": "three-gorges",
        "name": "Three Gorges Dam & Reservoir, China",
        "lat": 30.82,
        "lng": 111.00,
        "zoom": 10,
        "default_index": "NDWI",
        "default_years": [2016, 2026],
        "preview_delta": "+38.4% Surface Impoundment",
        "category": "Hydroelectric Inundation",
        "description": "Yangtze River containment creating a 600km long winding gorge reservoir.",
        "bbox": [110.8, 30.7, 111.2, 30.95]
    },
    {
        "id": "athabasca-oil-sands",
        "name": "Athabasca Oil Sands Mining, Alberta, Canada",
        "lat": 57.02,
        "lng": -111.58,
        "zoom": 10,
        "default_index": "NDBI",
        "default_years": [2016, 2026],
        "preview_delta": "+47.9% Open-Pit Strip Area",
        "category": "Resource Extraction",
        "description": "Vast open-pit bituminous sand strip mining and tailing pond networks.",
        "bbox": [-111.9, 56.8, -111.2, 57.25]
    },
    {
        "id": "lake-urmia",
        "name": "Lake Urmia Hyper-Saline Shrinkage, Iran",
        "lat": 37.75,
        "lng": 45.30,
        "zoom": 9,
        "default_index": "NDWI",
        "default_years": [2016, 2026],
        "preview_delta": "-56.8% Lake Footprint",
        "category": "Water Retreat",
        "description": "Severe desiccation turning one of the world's largest saltwater lakes into salt flats.",
        "bbox": [44.9, 37.3, 45.8, 38.2]
    },
    {
        "id": "borneo-palm-oil",
        "name": "Borneo Peatland Palm Oil Expansion, Indonesia",
        "lat": -1.85,
        "lng": 112.50,
        "zoom": 10,
        "default_index": "NDVI",
        "default_years": [2016, 2026],
        "preview_delta": "-39.2% Peat Swamp Canopy",
        "category": "Deforestation",
        "description": "Draining of ancient peat dome wetlands for commercial monoculture plantations.",
        "bbox": [112.1, -2.1, 112.9, -1.6]
    },
    {
        "id": "cairo-new-capital",
        "name": "New Administrative Capital, Cairo, Egypt",
        "lat": 30.01,
        "lng": 31.75,
        "zoom": 11,
        "default_index": "NDBI",
        "default_years": [2016, 2026],
        "preview_delta": "+88.5% Urban Footprint",
        "category": "Urban Sprawl",
        "description": "Megacity built from desert sand featuring the Iconic Tower and Octagon.",
        "bbox": [31.55, 29.85, 31.95, 30.15]
    },
    {
        "id": "great-salt-lake",
        "name": "Great Salt Lake Shoreline Retreat, Utah, USA",
        "lat": 41.15,
        "lng": -112.60,
        "zoom": 9,
        "default_index": "NDWI",
        "default_years": [2016, 2026],
        "preview_delta": "-35.2% Water Area",
        "category": "Water Retreat",
        "description": "Upstream agricultural consumption dropping water levels to record lows.",
        "bbox": [-113.1, 40.7, -112.1, 41.6]
    },
    {
        "id": "bhadla-solar",
        "name": "Bhadla Mega Solar Park, Thar Desert, India",
        "lat": 27.53,
        "lng": 71.91,
        "zoom": 11,
        "default_index": "NDBI",
        "default_years": [2016, 2026],
        "preview_delta": "+76.4% Photovoltaic Surface",
        "category": "Clean Energy Infrastructure",
        "description": "World's largest contiguous solar power plant spanning 14,000 arid acres.",
        "bbox": [71.8, 27.4, 72.05, 27.65]
    },
    {
        "id": "lake-chad",
        "name": "Lake Chad Shoreline Disappearance, Sahel Africa",
        "lat": 13.00,
        "lng": 14.50,
        "zoom": 9,
        "default_index": "NDWI",
        "default_years": [2016, 2026],
        "preview_delta": "-42.7% Aquatic Marshland",
        "category": "Water Retreat",
        "description": "Climate change and damming shrinking vital freshwater lifeline for 30 million people.",
        "bbox": [14.0, 12.5, 15.1, 13.5]
    },
    {
        "id": "jakarta-seawall",
        "name": "Jakarta Coastal Land Reclamation & Seawall, Indonesia",
        "lat": -6.11,
        "lng": 106.83,
        "zoom": 11,
        "default_index": "NDBI",
        "default_years": [2016, 2026],
        "preview_delta": "+33.8% Reclaimed Land",
        "category": "Coastal Engineering",
        "description": "Constructing offshore barrier islands against severe land subsidence.",
        "bbox": [106.7, -6.18, 106.95, -6.05]
    },
    {
        "id": "pantanal-fires",
        "name": "Pantanal Wetland Wildfire Scars, Brazil",
        "lat": -17.50,
        "lng": -56.50,
        "zoom": 9,
        "default_index": "NDVI",
        "default_years": [2016, 2026],
        "preview_delta": "-44.1% Canopy & Wetland Flora",
        "category": "Wildfire Scars",
        "description": "Historic droughts igniting catastrophic subterranean peat fires across the world's largest tropical wetland.",
        "bbox": [-57.2, -18.2, -55.8, -16.8]
    },
    {
        "id": "shanghai-pudong",
        "name": "Shanghai Lingang New Area Expansion, China",
        "lat": 30.90,
        "lng": 121.93,
        "zoom": 11,
        "default_index": "NDBI",
        "default_years": [2016, 2026],
        "preview_delta": "+45.2% Industrial Built-up",
        "category": "Urban Sprawl",
        "description": "Massive reclamation and high-tech manufacturing parks on the Hangzhou Bay coast.",
        "bbox": [121.75, 30.8, 122.1, 31.02]
    },
    {
        "id": "almeria-greenhouses",
        "name": "Almería 'Sea of Plastic' Greenhouses, Spain",
        "lat": 36.78,
        "lng": -2.75,
        "zoom": 11,
        "default_index": "NDBI",
        "default_years": [2016, 2026],
        "preview_delta": "+29.4% Plastic Sheeting Cover",
        "category": "Intensive Agriculture",
        "description": "High-albedo polyethylene greenhouse sprawl visible from space supplying European markets.",
        "bbox": [-2.9, 36.7, -2.6, 36.88]
    },
    {
        "id": "neom-the-line",
        "name": "NEOM 'The Line' Earthworks, Tabuk, Saudi Arabia",
        "lat": 28.05,
        "lng": 35.30,
        "zoom": 11,
        "default_index": "SAR",
        "default_years": [2016, 2026],
        "preview_delta": "+67.3% Excavated Corridor",
        "category": "Mega Infrastructure",
        "description": "Linear excavation trench spanning across coastal plains and mountain ranges.",
        "bbox": [35.1, 27.95, 35.5, 28.15]
    },
    {
        "id": "dead-sea",
        "name": "Dead Sea Southern Evaporation Pans & Sinkholes, Israel/Jordan",
        "lat": 31.30,
        "lng": 35.40,
        "zoom": 10,
        "default_index": "NDWI",
        "default_years": [2016, 2026],
        "preview_delta": "-28.7% Natural Brine Area",
        "category": "Water Retreat",
        "description": "Dropping water table creating thousands of collapse sinkholes along former shores.",
        "bbox": [35.25, 31.1, 35.55, 31.5]
    },
    {
        "id": "salton-sea",
        "name": "Salton Sea Playa Exposure, California, USA",
        "lat": 33.30,
        "lng": -115.85,
        "zoom": 10,
        "default_index": "NDWI",
        "default_years": [2016, 2026],
        "preview_delta": "-22.8% Water Surface",
        "category": "Water Retreat",
        "description": "Agricultural runoff cuts exposing toxic particulate dust beds in the Imperial Valley.",
        "bbox": [-116.1, 33.1, -115.6, 33.5]
    },
    {
        "id": "chernobyl-rewilding",
        "name": "Chernobyl Exclusion Zone Ecological Succession, Ukraine",
        "lat": 51.38,
        "lng": 30.10,
        "zoom": 10,
        "default_index": "NDVI",
        "default_years": [2016, 2026],
        "preview_delta": "+37.5% Spontaneous Canopy",
        "category": "Rewilding",
        "description": "Natural woodland restoration reclaiming evacuated concrete settlements.",
        "bbox": [29.8, 51.2, 30.4, 51.55]
    },
    {
        "id": "cerrado-soy",
        "name": "Cerrado Biome Soy Conversion, Matopiba, Brazil",
        "lat": -11.50,
        "lng": -46.00,
        "zoom": 9,
        "default_index": "NDVI",
        "default_years": [2016, 2026],
        "preview_delta": "-36.1% Native Savanna",
        "category": "Deforestation",
        "description": "Rapid transformation of biodiverse woody savanna into industrial pivot-irrigated grain fields.",
        "bbox": [-46.8, -12.2, -45.2, -10.8]
    },
    {
        "id": "pine-island-glacier",
        "name": "Pine Island Glacier Calving, West Antarctica",
        "lat": -75.10,
        "lng": -100.00,
        "zoom": 8,
        "default_index": "SAR",
        "default_years": [2016, 2026],
        "preview_delta": "-33.9% Ice Shelf Area",
        "category": "Glacier Loss",
        "description": "Deep warm circumpolar water melting the underwater grounding line of the Antarctic ice shelf.",
        "bbox": [-102.0, -75.8, -98.0, -74.4]
    },
    {
        "id": "singapore-tuas",
        "name": "Tuas Mega Port Terminal Reclamation, Singapore",
        "lat": 1.25,
        "lng": 103.62,
        "zoom": 12,
        "default_index": "NDBI",
        "default_years": [2016, 2026],
        "preview_delta": "+58.2% Deepwater Wharf",
        "category": "Coastal Reclamation",
        "description": "Consolidating all container operations onto 387 hectares of caisson-reclaimed land.",
        "bbox": [103.58, 1.20, 103.68, 1.30]
    },
    {
        "id": "chaco-deforestation",
        "name": "Gran Chaco Dry Forest Clearing, Paraguay",
        "lat": -21.80,
        "lng": -60.00,
        "zoom": 9,
        "default_index": "NDVI",
        "default_years": [2016, 2026],
        "preview_delta": "-41.5% Dry Forest Canopy",
        "category": "Deforestation",
        "description": "One of South America's most rapid deforestation hotspots clearing thorny scrub for pastures.",
        "bbox": [-60.7, -22.4, -59.3, -21.2]
    },
    {
        "id": "benban-solar",
        "name": "Benban Solar Park, Aswan Desert, Egypt",
        "lat": 24.45,
        "lng": 32.74,
        "zoom": 12,
        "default_index": "NDBI",
        "default_years": [2016, 2026],
        "preview_delta": "+81.0% Solar Array Area",
        "category": "Clean Energy Infrastructure",
        "description": "37 km² solar installation in the Western Desert generating 1.8 GW of clean energy.",
        "bbox": [32.68, 24.38, 32.80, 24.52]
    },
    {
        "id": "columbia-glacier",
        "name": "Columbia Glacier Tidewater Retreat, Alaska",
        "lat": 61.12,
        "lng": -147.05,
        "zoom": 10,
        "default_index": "SAR",
        "default_years": [2016, 2026],
        "preview_delta": "-29.5% Glacial Terminus",
        "category": "Glacier Loss",
        "description": "Rapid catastrophic retreat since 1980 leaving behind deep exposed fjord waters.",
        "bbox": [-147.3, 61.0, -146.8, 61.25]
    },
    {
        "id": "lake-powell",
        "name": "Lake Powell & Glen Canyon Shoreline Retreat, Utah/Arizona",
        "lat": 37.05,
        "lng": -111.45,
        "zoom": 10,
        "default_index": "NDWI",
        "default_years": [2016, 2026],
        "preview_delta": "-32.6% Water Extent",
        "category": "Drought & Water Loss",
        "description": "Colorado River drought dropping reservoir elevation to historic minimum pool levels.",
        "bbox": [-111.7, 36.9, -111.2, 37.2]
    },
    {
        "id": "california-central-valley",
        "name": "Central Valley Land Subsidence & Fallowing, California",
        "lat": 36.35,
        "lng": -119.85,
        "zoom": 10,
        "default_index": "NDVI",
        "default_years": [2016, 2026],
        "preview_delta": "-19.8% Irrigated Cropland",
        "category": "Agricultural Shift",
        "description": "Groundwater overdraft and water allocations causing widespread field fallowing.",
        "bbox": [-120.2, 36.1, -119.5, 36.6]
    },
    {
        "id": "fort-mcmurray-scar",
        "name": "Fort McMurray Boreal Wildfire Scar, Alberta, Canada",
        "lat": 56.70,
        "lng": -111.38,
        "zoom": 9,
        "default_index": "NDVI",
        "default_years": [2016, 2026],
        "preview_delta": "-38.3% Boreal Forest",
        "category": "Wildfire Scars",
        "description": "Massive 2016 Horse River wildfire scar transitioning through early stage aspen recovery.",
        "bbox": [-112.0, 56.4, -110.8, 57.0]
    },
    {
        "id": "tengger-solar",
        "name": "Tengger Desert Solar Park, Ningxia, China",
        "lat": 37.55,
        "lng": 105.05,
        "zoom": 11,
        "default_index": "NDBI",
        "default_years": [2016, 2026],
        "preview_delta": "+72.8% PV Module Density",
        "category": "Clean Energy Infrastructure",
        "description": "Extensive 43 km² photovoltaic field known as the Great Wall of Solar in the desert.",
        "bbox": [104.95, 37.45, 105.15, 37.65]
    },
    {
        "id": "escondida-copper",
        "name": "Minera Escondida Open-Pit Copper Mine, Chile",
        "lat": -24.26,
        "lng": -69.07,
        "zoom": 11,
        "default_index": "NDBI",
        "default_years": [2016, 2026],
        "preview_delta": "+43.6% Pit Terraces & Tailings",
        "category": "Industrial Mining",
        "description": "World's highest-producing copper mine expanding terraced pit excavations in the Atacama.",
        "bbox": [-69.18, -24.35, -68.96, -24.18]
    },
    {
        "id": "okavango-delta",
        "name": "Okavango Delta Seasonal Inundation Pulse, Botswana",
        "lat": -19.30,
        "lng": 22.80,
        "zoom": 9,
        "default_index": "NDWI",
        "default_years": [2016, 2026],
        "preview_delta": "+24.5% Seasonal Wetland Pulse",
        "category": "Wetland Inundation",
        "description": "Annual Angolan highland flood waters spreading across Kalahari sands.",
        "bbox": [22.2, -19.8, 23.4, -18.8]
    },
    {
        "id": "toshka-lakes",
        "name": "Toshka Lakes Spillway Filling, New Valley, Egypt",
        "lat": 23.35,
        "lng": 31.00,
        "zoom": 9,
        "default_index": "NDWI",
        "default_years": [2016, 2026],
        "preview_delta": "+68.2% Desert Lake Surfaces",
        "category": "Hydro Surplus & Inundation",
        "description": "Lake Nasser floodwaters overflowing into the Sahara depressions via the Sadat Canal.",
        "bbox": [30.5, 23.0, 31.5, 23.7]
    },
    {
        "id": "beijing-daxing",
        "name": "Beijing Daxing International Airport & Aerotropolis, China",
        "lat": 39.51,
        "lng": 116.41,
        "zoom": 12,
        "default_index": "NDBI",
        "default_years": [2016, 2026],
        "preview_delta": "+61.5% Concrete Runway Footprint",
        "category": "Aviation Infrastructure",
        "description": "Mega-airport starfish terminal built over 47 square kilometers south of Beijing.",
        "bbox": [116.32, 39.45, 116.50, 39.58]
    },
    {
        "id": "mar-menor",
        "name": "Mar Menor Coastal Salt Lagoon Algal Blooms, Spain",
        "lat": 37.72,
        "lng": -0.80,
        "zoom": 11,
        "default_index": "NDVI",
        "default_years": [2016, 2026],
        "preview_delta": "+41.3% Algal Biomass Density",
        "category": "Eutrophication",
        "description": "Agricultural nitrate runoff triggering periodic catastrophic ecological anoxia.",
        "bbox": [-0.92, 37.64, -0.68, 37.80]
    },
    {
        "id": "poyang-lake",
        "name": "Poyang Lake Floodplain Recession, Jiangxi, China",
        "lat": 29.10,
        "lng": 116.30,
        "zoom": 9,
        "default_index": "NDWI",
        "default_years": [2016, 2026],
        "preview_delta": "-37.9% Open Water Extent",
        "category": "Water Retreat",
        "description": "China's largest freshwater lake experiencing prolonged droughts and grass marsh exposure.",
        "bbox": [115.8, 28.6, 116.8, 29.6]
    },
    {
        "id": "mir-mine",
        "name": "Mir Diamond Kimberlite Open Pit, Siberia, Russia",
        "lat": 62.53,
        "lng": 113.99,
        "zoom": 12,
        "default_index": "NDBI",
        "default_years": [2016, 2026],
        "preview_delta": "+15.2% Excavation Volume",
        "category": "Industrial Mining",
        "description": "525-meter deep kimberlite pipe creating vortex air currents in the permafrost.",
        "bbox": [113.92, 62.50, 114.06, 62.56]
    },
    {
        "id": "kiruna-mine",
        "name": "Kiruna Town Relocation & Iron Ore Subsidence, Sweden",
        "lat": 67.85,
        "lng": 20.22,
        "zoom": 12,
        "default_index": "SAR",
        "default_years": [2016, 2026],
        "preview_delta": "+48.9% Subsidence Crack Extent",
        "category": "Geotechnical Subsidence",
        "description": "LKAB underground mining deformation necessitating the relocation of the entire city.",
        "bbox": [20.15, 67.81, 20.30, 67.89]
    },
    {
        "id": "songdo-smart-city",
        "name": "Songdo International City Reclamation, Incheon, South Korea",
        "lat": 37.39,
        "lng": 126.65,
        "zoom": 12,
        "default_index": "NDBI",
        "default_years": [2016, 2026],
        "preview_delta": "+39.7% Built-Up High-Rise Density",
        "category": "Coastal Reclamation",
        "description": "Ubiquitous smart city built on 600 hectares of reclaimed Yellow Sea mudflats.",
        "bbox": [126.60, 37.35, 126.70, 37.43]
    },
    {
        "id": "hambantota-port",
        "name": "Hambantota Deep Sea Port & Industrial Enclave, Sri Lanka",
        "lat": 6.12,
        "lng": 81.11,
        "zoom": 12,
        "default_index": "NDBI",
        "default_years": [2016, 2026],
        "preview_delta": "+54.0% Port Basin & Wharves",
        "category": "Maritime Infrastructure",
        "description": "Deep-water artificial inland port dredged along southern Indian Ocean shipping lanes.",
        "bbox": [81.07, 6.08, 81.15, 6.16]
    },
    {
        "id": "po-valley-drought",
        "name": "Po River Valley Agricultural Stress, Northern Italy",
        "lat": 45.05,
        "lng": 10.30,
        "zoom": 9,
        "default_index": "NDVI",
        "default_years": [2016, 2026],
        "preview_delta": "-21.4% Crop Canopy Health",
        "category": "Agricultural Drought",
        "description": "Historical Alpine snowpack reduction triggering widespread agricultural rationing.",
        "bbox": [9.8, 44.8, 10.8, 45.3]
    },
    {
        "id": "hamun-lakes",
        "name": "Hamun Oasis Desiccation, Sistan Basin, Iran/Afghanistan",
        "lat": 31.00,
        "lng": 61.30,
        "zoom": 9,
        "default_index": "NDWI",
        "default_years": [2016, 2026],
        "preview_delta": "-51.8% Oasis Wetland Extent",
        "category": "Water Retreat",
        "description": "Helmand River damming upstream desiccating endorheic lake beds into dust storm sources.",
        "bbox": [60.8, 30.6, 61.8, 31.4]
    },
    {
        "id": "kangerlussuaq-melt",
        "name": "Kangerlussuaq Ice Sheet Melt Margin, Western Greenland",
        "lat": 67.01,
        "lng": -50.15,
        "zoom": 9,
        "default_index": "SAR",
        "default_years": [2016, 2026],
        "preview_delta": "-28.1% Glacial Margin Area",
        "category": "Glacier Loss",
        "description": "Supraglacial melt lake drainage channels calving off Point 660 ice margins.",
        "bbox": [-50.7, 66.8, -49.6, 67.2]
    },
    {
        "id": "colorado-river-delta",
        "name": "Colorado River Delta Desiccation, Baja California, Mexico",
        "lat": 31.85,
        "lng": -114.95,
        "zoom": 10,
        "default_index": "NDWI",
        "default_years": [2016, 2026],
        "preview_delta": "-41.0% Estuarine Waterways",
        "category": "Water Retreat",
        "description": "Historic estuary desiccated into salt crusts before occasional pulse flows.",
        "bbox": [-115.2, 31.6, -114.7, 32.1]
    },
    {
        "id": "mount-st-helens",
        "name": "Mount St. Helens Blast Zone Canopy Regrowth, Washington, USA",
        "lat": 46.20,
        "lng": -122.18,
        "zoom": 11,
        "default_index": "NDVI",
        "default_years": [2016, 2026],
        "preview_delta": "+44.7% Pioneer Conifer Regrowth",
        "category": "Ecological Recovery",
        "description": "Four decades of primary ecological succession transforming volcanic pumice plains.",
        "bbox": [-122.3, 46.12, -122.05, 46.28]
    },
    {
        "id": "copper-mountain",
        "name": "Copper Mountain Open Pit Expansion, British Columbia, Canada",
        "lat": 49.33,
        "lng": -120.52,
        "zoom": 12,
        "default_index": "NDBI",
        "default_years": [2016, 2026],
        "preview_delta": "+38.9% Waste Rock Benches",
        "category": "Industrial Mining",
        "description": "Porphyry copper-gold mine benching expansion in the Similkameen region.",
        "bbox": [-120.58, 49.30, -120.46, 49.36]
    },
    {
        "id": "mosul-dam",
        "name": "Mosul Dam Reservoir Fluctuation, Tigris River, Iraq",
        "lat": 36.63,
        "lng": 42.82,
        "zoom": 10,
        "default_index": "NDWI",
        "default_years": [2016, 2026],
        "preview_delta": "-27.3% Shoreline Water Surface",
        "category": "Reservoir Fluctuation",
        "description": "Drought and upstream Turkish dams altering Tigris basin impoundment volumes.",
        "bbox": [42.6, 36.45, 43.05, 36.8]
    }
]

class SearchService:
    def __init__(self):
        self.hotspots = GLOBAL_HOTSPOTS

    def semantic_pattern_search(self, query: str) -> List[Dict[str, Any]]:
        """
        Matches free-text pattern queries against the pre-seeded 50+ hotspot index.
        Supports terms like 'shrinking lakes', 'deforestation', 'urban sprawl',
        'mining', 'glacier', 'solar', 'fire', 'dam', etc.
        """
        q = query.lower().strip()
        tokens = [t for t in q.replace(",", " ").replace("-", " ").split() if len(t) > 2]
        if not tokens:
            return self.hotspots[:8]

        scored_results = []
        for spot in self.hotspots:
            score = 0
            searchable_text = f"{spot['name']} {spot['category']} {spot['description']} {spot['default_index']}".lower()

            # Exact phrase match
            if q in searchable_text:
                score += 15

            # Semantic keyword synonyms mapping
            synonym_boosts = {
                "lake": ["water", "desiccation", "retreat", "ndwi", "reservoir", "shrink"],
                "lakes": ["water", "desiccation", "retreat", "ndwi", "reservoir", "shrink"],
                "water": ["lake", "ndwi", "reservoir", "desiccation", "flood", "estuary"],
                "forest": ["deforestation", "canopy", "ndvi", "logging", "clearing", "amazon"],
                "fire": ["wildfire", "firms", "burn", "scar", "flame"],
                "urban": ["sprawl", "ndbi", "city", "infrastructure", "construction", "reclamation"],
                "city": ["urban", "sprawl", "ndbi", "building", "airport", "capital"],
                "glacier": ["ice", "retreat", "melt", "greenland", "antarctica", "sar"],
                "ice": ["glacier", "sar", "shelf", "fjord", "arctic"],
                "solar": ["clean energy", "photovoltaic", "park", "desert", "ndbi"],
                "mining": ["open-pit", "lithium", "copper", "sand", "ore", "pit"],
                "mine": ["open-pit", "quarry", "mining", "extraction"],
            }

            for token in tokens:
                if token in spot['name'].lower():
                    score += 8
                if token in spot['category'].lower():
                    score += 6
                if token in spot['description'].lower():
                    score += 4
                if token == spot['default_index'].lower():
                    score += 3

                # Boost based on synonym clusters
                for syn_key, syn_list in synonym_boosts.items():
                    if token == syn_key:
                        for s in syn_list:
                            if s in searchable_text:
                                score += 3

            if score > 0:
                scored_results.append((score, spot))

        # Sort descending by score
        scored_results.sort(key=lambda x: x[0], reverse=True)
        return [item[1] for item in scored_results]

    async def geocode_osm_nominatim(self, query: str) -> List[Dict[str, Any]]:
        """Queries OpenStreetMap Nominatim for locations not present in curated hotspots."""
        url = "https://nominatim.openstreetmap.org/search"
        headers = {"User-Agent": "SatQuery-EarthObservation-Platform/1.0"}
        params = {
            "q": query,
            "format": "json",
            "polygon_geojson": 1,
            "limit": 3
        }
        results = []
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                resp = await client.get(url, params=params, headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    for item in data:
                        lat = float(item["lat"])
                        lng = float(item["lon"])
                        bbox_raw = item.get("boundingbox", [lat - 0.1, lat + 0.1, lng - 0.1, lng + 0.1])
                        # Nominatim bbox: [min_lat, max_lat, min_lng, max_lng]
                        bbox = [float(bbox_raw[2]), float(bbox_raw[0]), float(bbox_raw[3]), float(bbox_raw[1])]
                        results.append({
                            "id": f"osm-{item.get('osm_id', 'loc')}",
                            "name": item.get("display_name", query)[:60],
                            "lat": lat,
                            "lng": lng,
                            "zoom": 11,
                            "default_index": "NDVI",
                            "default_years": [2016, 2026],
                            "preview_delta": "Multi-temporal satellite observation",
                            "category": "Geocoded Landmark",
                            "description": item.get("display_name", query),
                            "bbox": bbox
                        })
        except Exception as e:
            logger.warning(f"OSM Nominatim lookup failed: {e}")

        return results

    async def search(self, query: str) -> List[Dict[str, Any]]:
        """
        Unified search endpoint:
        1. Evaluates semantic pattern matching over 50+ curated presets.
        2. If results are sparse (< 2), blends with live OSM Nominatim geocoding.
        """
        curated_matches = self.semantic_pattern_search(query)
        if len(curated_matches) >= 3 or not query.strip():
            return curated_matches[:12]

        # Fetch geocoding supplement
        osm_matches = await self.geocode_osm_nominatim(query)
        combined = curated_matches + osm_matches
        return combined[:12]

search_service = SearchService()
