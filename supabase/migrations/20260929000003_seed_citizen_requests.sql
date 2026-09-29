-- TASK-012: Seed ~50 Citizen Requests
-- 52 realistic natural-language citizen requests producing visible planning hotspots
-- Multilingual: English, Hindi, Kannada, Tamil
-- No citizen PII (names, phone numbers, home addresses, or Aadhaar)

INSERT INTO citizen_requests (
    source, raw_text, language_code, state, district, category,
    need_summary, severity, ai_confidence, created_at
) VALUES
-- Ramanagara - roads (10 requests - Primary Demo Hotspot)
('text', 'In Ramanagara, the road connecting our village to the main highway is washed out every monsoon and ambulances cannot enter.', 'en', 'Karnataka', 'Ramanagara', 'roads', 'Rehabilitation and all-weather surfacing of village link road for emergency vehicle access.', 'high', 0.96, now() - interval '2 days'),
('voice', 'ಮಳೆಗಾಲದಲ್ಲಿ ರಾಮನಗರ ಜಿಲ್ಲೆಯ ನಮ್ಮ ಹಳ್ಳಿಯ ಮುಖ್ಯ ರಸ್ತೆ ಸಂಪೂರ್ಣವಾಗಿ ಕೊಚ್ಚಿಹೋಗಿ ವಾಹನ ಸಂಚಾರ ಅಸಾಧ್ಯವಾಗಿದೆ.', 'kn', 'Karnataka', 'Ramanagara', 'roads', 'Reconstruction of flood-damaged village access road.', 'high', 0.94, now() - interval '3 days'),
('text', 'ರಾಮನಗರ ತಾಲೂಕಿನ ಗ್ರಾಮೀಣ ರಸ್ತೆಯಲ್ಲಿ ದೊಡ್ಡ ಹಳ್ಳಗಳು ಬಿದ್ದಿದ್ದು ಶಾಲಾ ಬಸ್ ಬರಲು ನಿರಾಕರಿಸುತ್ತಿದ್ದಾರೆ.', 'kn', 'Karnataka', 'Ramanagara', 'roads', 'Repair of hazardous potholes on rural bus route.', 'high', 0.92, now() - interval '4 days'),
('text', 'The culvert on the Ramanagara rural link road collapsed during heavy rains, cutting off 3 villages.', 'en', 'Karnataka', 'Ramanagara', 'roads', 'Urgent reconstruction of collapsed culvert connecting three villages.', 'high', 0.95, now() - interval '5 days'),
('voice', 'In Ramanagara taluk, farmers are unable to transport silk cocoons to market due to unpaved mud road.', 'en', 'Karnataka', 'Ramanagara', 'roads', 'Paving of agricultural transport corridor for silk producers.', 'medium', 0.91, now() - interval '6 days'),
('text', 'ನಮ್ಮ ಊರಿನ ರಸ್ತೆಗೆ ಕಲ್ಲಿನ ಜಲ್ಲಿ ಮಾತ್ರ ಹಾಕಿದ್ದಾರೆ, ಡಾಂಬರೀಕರಣ ಮಾಡದೆ ಬಿಟ್ಟಿದ್ದಾರೆ.', 'kn', 'Karnataka', 'Ramanagara', 'roads', 'Completion of asphalt surfacing on gravel road.', 'medium', 0.89, now() - interval '7 days'),
('text', 'Heavy soil erosion has narrowed the approach road to Ramanagara village bypass to single lane.', 'en', 'Karnataka', 'Ramanagara', 'roads', 'Widening and embankment strengthening of village bypass road.', 'medium', 0.93, now() - interval '8 days'),
('text', 'രാമനഗര റോഡിൽ മഴക്കാലത്ത് വെള്ളക്കെട്ട് കാരണം ഇരുಚಕ್ರ ವಾಹನಗಳು ಅಪಘಾತಕ್ಕೀಡಾಗುತ್ತಿವೆ.', 'kn', 'Karnataka', 'Ramanagara', 'roads', 'Stormwater drainage and road resurfacing to prevent accidents.', 'high', 0.90, now() - interval '10 days'),
('text', 'Missing bridge over storm stream isolates our village during monsoon in Ramanagara.', 'en', 'Karnataka', 'Ramanagara', 'roads', 'Construction of small bridge across seasonal stream.', 'high', 0.97, now() - interval '12 days'),
('text', 'School children walk 4 km along broken road because transport stopped coming to Ramanagara hamlet.', 'en', 'Karnataka', 'Ramanagara', 'roads', 'Road rehabilitation to restore public transportation for school students.', 'high', 0.94, now() - interval '14 days'),

-- Bahraich - water (8 requests - Hotspot #2)
('text', 'बहराइच जिले के हमारे गांव में हैंडपंप से गंदा और पीला पानी आ रहा है, जिससे लोग बीमार पड़ रहे हैं।', 'hi', 'Uttar Pradesh', 'Bahraich', 'water', 'Replacement of contaminated shallow handpumps with safe drinking water network.', 'high', 0.96, now() - interval '1 day'),
('text', 'In Bahraich rural blocks, groundwater arsenic levels are high and there is no piped tap water supply.', 'en', 'Uttar Pradesh', 'Bahraich', 'water', 'Provision of piped drinking water supply with arsenic filtration in rural blocks.', 'high', 0.95, now() - interval '2 days'),
('voice', 'गांव में तीन में से दो नल सूख चुके हैं, महिलाओं को 2 किलोमीटर दूर से पानी लाना पड़ता है।', 'hi', 'Uttar Pradesh', 'Bahraich', 'water', 'Drilling of deep borewells and piped distribution to reduce walking distance.', 'high', 0.93, now() - interval '4 days'),
('text', 'Water tank installed two years ago in Bahraich village has no pump connection or distribution pipeline.', 'en', 'Uttar Pradesh', 'Bahraich', 'water', 'Operationalization and pipeline connection for existing overhead water tank.', 'medium', 0.92, now() - interval '6 days'),
('text', 'बहराइच के प्राथमिक विद्यालय में पीने के पानी की कोई सुविधा नहीं है।', 'hi', 'Uttar Pradesh', 'Bahraich', 'water', 'Installation of clean drinking water supply in government primary school.', 'high', 0.94, now() - interval '7 days'),
('text', 'Severe water shortages during summer months require regular water tanker supply in Bahraich hamlets.', 'en', 'Uttar Pradesh', 'Bahraich', 'water', 'Long-term piped water infrastructure to resolve recurrent summer water crises.', 'high', 0.91, now() - interval '9 days'),
('text', 'हमारे मोहल्ले की पाइपलाइन टूट गई है और 15 दिनों से पीने का पानी नहीं आ रहा।', 'hi', 'Uttar Pradesh', 'Bahraich', 'water', 'Urgent repair of damaged distribution pipeline.', 'high', 0.95, now() - interval '11 days'),
('text', 'Community well in Bahraich village is open and unhygienic, need covered water filtration unit.', 'en', 'Uttar Pradesh', 'Bahraich', 'water', 'Installation of covered community filtration unit over open well.', 'medium', 0.88, now() - interval '15 days'),

-- Barmer - power (7 requests - Hotspot #3)
('text', 'बाड़मेर जिले में हमारे गांव में दिन में 10-12 घंटे बिजली कटौती रहती है, भीषण गर्मी में जीना मुश्किल है।', 'hi', 'Rajasthan', 'Barmer', 'power', 'Upgradation of rural feeder line to eliminate prolonged daily power outages.', 'high', 0.95, now() - interval '1 day'),
('text', 'In Barmer desert area, local transformer blew up 10 days ago and has not been replaced yet.', 'en', 'Rajasthan', 'Barmer', 'power', 'Urgent replacement of blown 63 kVA community power transformer.', 'high', 0.97, now() - interval '3 days'),
('voice', 'बार-बार वोल्टेज कम होने से ट्यूबवेल नहीं चल पा रहे हैं और फसलें सूख रही हैं।', 'hi', 'Rajasthan', 'Barmer', 'power', 'Voltage stabilization and 3-phase agricultural power line enhancement.', 'high', 0.93, now() - interval '5 days'),
('text', 'Loose high-tension electric wires hanging dangerously close to village roofs in Barmer.', 'en', 'Rajasthan', 'Barmer', 'power', 'Restringing and elevation of hazardous sagging power cables.', 'high', 0.96, now() - interval '7 days'),
('text', 'बाड़मेर के उप स्वास्थ्य केंद्र में बिजली न होने से दवाइयां और टीके खराब हो रहे हैं।', 'hi', 'Rajasthan', 'Barmer', 'power', 'Dedicated continuous power supply and solar backup for rural health sub-center.', 'high', 0.94, now() - interval '9 days'),
('text', 'Frequent unplanned blackouts disrupt nighttime study for high school board examinees.', 'en', 'Rajasthan', 'Barmer', 'power', 'Stabilization of residential grid power during evening hours.', 'medium', 0.90, now() - interval '12 days'),
('text', 'New residential settlement in Barmer outskirts is still waiting for electrification poles.', 'en', 'Rajasthan', 'Barmer', 'power', 'Extension of power distribution poles to un-electrified hamlet.', 'medium', 0.92, now() - interval '16 days'),

-- Dharmapuri - healthcare (6 requests - Hotspot #4)
('text', 'தருமபுரி மாவட்டத்தில் எங்கள் கிராமத்திலிருந்து ஆரம்ப சுகாதார நிலையம் 18 கிமீ தொலைவில் உள்ளது, அவசர காலங்களில் செல்ல முடியாது.', 'ta', 'Tamil Nadu', 'Dharmapuri', 'healthcare', 'Establishment of local primary healthcare sub-center to reduce 18 km travel distance.', 'high', 0.96, now() - interval '2 days'),
('text', 'Primary Health Centre in Dharmapuri rural block has no doctor after 2 PM and lacks maternity facilities.', 'en', 'Tamil Nadu', 'Dharmapuri', 'healthcare', 'Provision of 24/7 medical staffing and emergency maternity facilities at PHC.', 'high', 0.95, now() - interval '3 days'),
('voice', 'கிராமத்தில் ஆம்புலன்ஸ் சேவை வர 2 மணி நேரம் ஆகிறது, அவசர சிகிச்சை கிடைக்கவில்லை.', 'ta', 'Tamil Nadu', 'Dharmapuri', 'healthcare', 'Stationing of dedicated emergency response ambulance in tribal taluk.', 'high', 0.94, now() - interval '5 days'),
('text', 'Dharmapuri community health centre lacks basic diagnostic equipment like X-ray and lab test kits.', 'en', 'Tamil Nadu', 'Dharmapuri', 'healthcare', 'Upgrading diagnostic laboratory and imaging equipment at community health centre.', 'medium', 0.91, now() - interval '8 days'),
('text', 'தருமபுரி அரசு மருத்துவமனையில் பாம்புக்கடி மருந்து இருப்பு இல்லை.', 'ta', 'Tamil Nadu', 'Dharmapuri', 'healthcare', 'Emergency stocking of antivenom and critical life-saving drugs.', 'high', 0.97, now() - interval '10 days'),
('text', 'Mobile medical unit has not visited our remote hill village in Dharmapuri for six months.', 'en', 'Tamil Nadu', 'Dharmapuri', 'healthcare', 'Resumption of regular fortnightly mobile health clinic visits.', 'medium', 0.89, now() - interval '13 days'),

-- Varanasi - sanitation (5 requests - Hotspot #5)
('text', 'वाराणसी के इस वार्ड में खुली नालियों का गंदा पानी सड़कों पर बह रहा है, बीमारी फैलने का खतरा है।', 'hi', 'Uttar Pradesh', 'Varanasi', 'sanitation', 'Construction of covered concrete drainage network to stop sewage street overflow.', 'high', 0.95, now() - interval '2 days'),
('text', 'Community toilet block in peri-urban Varanasi has had no water connection or cleaning for two months.', 'en', 'Uttar Pradesh', 'Varanasi', 'sanitation', 'Restoration of water supply and regular municipal maintenance of community toilets.', 'high', 0.93, now() - interval '4 days'),
('voice', 'कूड़ा उठाने वाली गाड़ी हमारे मोहल्ले में नहीं आती, सड़क किनारे कचरे का बड़ा ढेर लगा है।', 'hi', 'Uttar Pradesh', 'Varanasi', 'sanitation', 'Extension of door-to-door solid waste collection to unserved ward.', 'medium', 0.90, now() - interval '6 days'),
('text', 'Broken sewer manhole covers in Varanasi residential lane pose severe safety hazard to pedestrians.', 'en', 'Uttar Pradesh', 'Varanasi', 'sanitation', 'Replacement of missing and damaged concrete sewer manhole covers.', 'high', 0.94, now() - interval '9 days'),
('text', 'जलभराव और सीवर ओवरफ्लो के कारण बाजार क्षेत्र में दुकानदारों को भारी परेशानी हो रही है।', 'hi', 'Uttar Pradesh', 'Varanasi', 'sanitation', 'Desilting of main trunk sewer line to eliminate commercial zone overflow.', 'medium', 0.91, now() - interval '12 days'),

-- Tumakuru - education (4 requests)
('text', 'ತುಮಕೂರು ಜಿಲ್ಲೆಯ ಸರ್ಕಾರಿ ಪ್ರಾಥಮಿಕ ಶಾಲೆಯಲ್ಲಿ ಹೆಣ್ಣುಮಕ್ಕಳಿಗೆ ಶೌಚಾಲಯ ಮತ್ತು ನೀರಿನ ಸೌಲಭ್ಯವಿಲ್ಲ.', 'kn', 'Karnataka', 'Tumakuru', 'education', 'Construction of dedicated functional girls toilets and water supply in primary school.', 'high', 0.96, now() - interval '3 days'),
('text', 'Government high school building in Tumakuru has leaking roofs and cracked walls in 4 classrooms.', 'en', 'Karnataka', 'Tumakuru', 'education', 'Structural renovation and waterproofing of school classroom building.', 'high', 0.93, now() - interval '5 days'),
('text', 'ಕಂಪ್ಯೂಟರ್ ಲ್ಯಾಬ್ ಸೌಲಭ್ಯವಿಲ್ಲದೆ ಗ್ರಾಮೀಣ ಮಕ್ಕಳು ಡಿಜಿಟಲ್ ಶಿಕ್ಷಣದಿಂದ ವಂಚಿತರಾಗಿದ್ದಾರೆ.', 'kn', 'Karnataka', 'Tumakuru', 'education', 'Setup of basic digital computer laboratory in rural secondary school.', 'medium', 0.88, now() - interval '8 days'),
('text', 'No boundary wall in Tumakuru village school allows stray cattle to enter playground during classes.', 'en', 'Karnataka', 'Tumakuru', 'education', 'Construction of perimeter security wall for government school campus.', 'medium', 0.91, now() - interval '14 days'),

-- Dausa - roads (4 requests)
('text', 'दौसा जिले में नेशनल हाईवे से जोड़ने वाली 5 किमी सड़क पूरी तरह गड्ढों में तब्दील हो चुकी है।', 'hi', 'Rajasthan', 'Dausa', 'roads', 'Complete resurfacing and blacktopping of 5 km link road to national highway.', 'high', 0.94, now() - interval '3 days'),
('text', 'Agricultural tractors cannot transport wheat produce due to muddy unpaved road in Dausa block.', 'en', 'Rajasthan', 'Dausa', 'roads', 'Gravel and tarmac paving of agricultural market access road.', 'medium', 0.90, now() - interval '6 days'),
('text', 'सड़क पर स्ट्रीट लाइट न होने के कारण रात में दुर्घटनाओं की आशंका बनी रहती है।', 'hi', 'Rajasthan', 'Dausa', 'roads', 'Installation of solar streetlighting along hazardous village curve.', 'medium', 0.89, now() - interval '10 days'),
('text', 'Causeway washed out during last flash flood cutting off school van access in Dausa hamlet.', 'en', 'Rajasthan', 'Dausa', 'roads', 'Rebuilding of concrete causeway with adequate stormwater pipe openings.', 'high', 0.95, now() - interval '13 days'),

-- Madurai - roads & water (4 requests)
('text', 'மதுரை புறநகர் கிராமத்திற்கு அரசு பேருந்து செல்லும் இணைப்பு சாலை மிகவும் குறுகலாகவும் பழுதடைந்தும் உள்ளது.', 'ta', 'Tamil Nadu', 'Madurai', 'roads', 'Widening and repaving of rural approach road for bus transit.', 'medium', 0.92, now() - interval '4 days'),
('text', 'Main drinking water pipeline in Madurai residential area burst, thousands without water.', 'en', 'Tamil Nadu', 'Madurai', 'water', 'Emergency repair and replacement of corroded distribution trunk line.', 'high', 0.95, now() - interval '5 days'),
('text', 'மதுரை கிராமப்புற சாலையில் பஸ் நிழற்குடை இல்லாததால் வெயில் மற்றும் மழையில் நிற்க வேண்டியுள்ளது.', 'ta', 'Tamil Nadu', 'Madurai', 'roads', 'Construction of roadside passenger waiting shelter.', 'low', 0.87, now() - interval '9 days'),
('text', 'Underground drainage connection works left open and unfinished in Madurai residential ward.', 'en', 'Tamil Nadu', 'Madurai', 'sanitation', 'Expediting completion of underground drainage street piping and repaving.', 'medium', 0.91, now() - interval '15 days'),

-- Other distributed requests (4 requests)
('text', 'Solar street lights installed in Tumakuru village center have dead batteries and need replacement.', 'en', 'Karnataka', 'Tumakuru', 'power', 'Maintenance and battery replacement for non-functional solar streetlights.', 'low', 0.88, now() - interval '7 days'),
('text', 'वाराणसी के ग्रामीण क्षेत्र में प्राथमिक विद्यालय के पास कोई प्राथमिक स्वास्थ्य केंद्र नहीं है।', 'hi', 'Uttar Pradesh', 'Varanasi', 'healthcare', 'Establishment of primary health outpost near rural school cluster.', 'medium', 0.90, now() - interval '8 days'),
('text', 'Barmer desert village needs rainwater harvesting tank installation for community use.', 'en', 'Rajasthan', 'Barmer', 'water', 'Construction of traditional covered rainwater harvesting tank (tanka).', 'medium', 0.92, now() - interval '11 days'),
('text', 'தருமபுரி கிராமத்தில் குப்பை சேகரிப்பு தொட்டிகள் இல்லாததால் திறந்தவெளியில் குப்பை கொட்டப்படுகிறது.', 'ta', 'Tamil Nadu', 'Dharmapuri', 'sanitation', 'Placement of community waste bins and regular clearance schedule.', 'low', 0.86, now() - interval '16 days');
