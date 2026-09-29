/**
 * Static geographic dataset of Indian States, Union Territories, and Districts.
 * Provides 100% deterministic, zero-dependency validation and normalization.
 *
 * Core architectural principle:
 * - Citizen intake is India-wide (all 28 States and 8 UTs).
 * - Planning hotspot analytics is currently calibrated for the 8 pilot districts.
 */

export const PILOT_STATES_AND_DISTRICTS: Record<string, string[]> = {
  Karnataka: ["Ramanagara", "Tumakuru"],
  "Uttar Pradesh": ["Bahraich", "Varanasi"],
  Rajasthan: ["Barmer", "Dausa"],
  "Tamil Nadu": ["Dharmapuri", "Madurai"]
};

export const ALL_PILOT_DISTRICTS = Object.entries(PILOT_STATES_AND_DISTRICTS).flatMap(
  ([state, districts]) => districts.map((district) => ({ state, district }))
);

/**
 * Complete list of all 28 Indian States and 8 Union Territories
 */
export const ALL_INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  // Union Territories
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry"
] as const;

export type IndianState = (typeof ALL_INDIAN_STATES)[number];

export function isIndianState(state: string): state is IndianState {
  return (ALL_INDIAN_STATES as readonly string[]).includes(state);
}

/**
 * Districts grouped by State/UT.
 * Covers major districts across all states with comprehensive pilot coverage.
 */
export const INDIAN_DISTRICTS_BY_STATE: Record<string, string[]> = {
  "Andhra Pradesh": [
    "Ananthapuramu", "Anakapalli", "Annamayya", "Bapatla", "Chittoor",
    "Dr. B.R. Ambedkar Konaseema", "East Godavari", "Eluru", "Guntur", "Kakinada",
    "Krishna", "Kurnool", "Nandyal", "NTR", "Palnadu", "Parvathipuram Manyam",
    "Prakasam", "Sri Potti Sriramulu Nellore", "Sri Sathya Sai", "Srikakulam",
    "Tirupati", "Visakhapatnam", "Vizianagaram", "West Godavari", "YSR"
  ],
  "Arunachal Pradesh": [
    "Anjaw", "Changlang", "Dibang Valley", "East Kameng", "East Siang",
    "Kamle", "Kra Daadi", "Kurung Kumey", "Lepa Rada", "Lohit", "Longding",
    "Lower Dibang Valley", "Lower Siang", "Lower Subansiri", "Namsai",
    "Pakke Kessang", "Papum Pare", "Shi Yomi", "Siang", "Tawang", "Tirap",
    "Upper Siang", "Upper Subansiri", "West Kameng", "West Siang"
  ],
  Assam: [
    "Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo",
    "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Dima Hasao",
    "Goalpara", "Golaghat", "Hailakandi", "Hojai", "Jorhat", "Kamrup",
    "Kamrup Metropolitan", "Karbi Anglong", "Karimganj", "Kokrajhar",
    "Lakhimpur", "Majuli", "Morigaon", "Nagaon", "Nalbari", "Sivasagar",
    "Sonitpur", "South Salmara-Mankachar", "Tinsukia", "Udalguri", "West Karbi Anglong"
  ],
  Bihar: [
    "Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur",
    "Bhojpur", "Buxar", "Darbhanga", "East Champaran", "Gaya", "Gopalganj",
    "Jamui", "Jehanabad", "Kaimur", "Katihar", "Khagaria", "Kishanganj",
    "Lakhisarai", "Madhepura", "Madhubani", "Munger", "Muzaffarpur",
    "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa", "Samastipur",
    "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul",
    "Vaishali", "West Champaran"
  ],
  Chhattisgarh: [
    "Balod", "Baloda Bazar", "Balrampur", "Bastar", "Bemetara", "Bijapur",
    "Bilaspur", "Dantewada", "Dhamtari", "Durg", "Gariaband", "Gaurela Pendra Marwahi",
    "Janjgir-Champa", "Jashpur", "Kabirdham", "Kanker", "Khairagarh-Chhuikhadan-Gandai",
    "Kondagaon", "Korba", "Koriya", "Mahasamund", "Manendragarh-Chirmiri-Bharatpur",
    "Mohla-Manpur-Ambagarh Chowki", "Mungeli", "Narayanpur", "Raigarh", "Raipur",
    "Rajnandgaon", "Sarangarh-Bilaigarh", "Sakti", "Sukma", "Surajpur", "Surguja"
  ],
  Goa: [
    "North Goa", "South Goa"
  ],
  Gujarat: [
    "Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch",
    "Bhavnagar", "Botad", "Chhota Udaipur", "Dahod", "Dang", "Devbhumi Dwarka",
    "Gandhinagar", "Gir Somnath", "Jamnagar", "Junagadh", "Kheda", "Kutch",
    "Mahisagar", "Mehsana", "Morbi", "Narmada", "Navsari", "Panchmahal",
    "Patan", "Porbandar", "Rajkot", "Sabarkantha", "Surat", "Surendranagar",
    "Tapi", "Vadodara", "Valsad"
  ],
  Haryana: [
    "Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurugram",
    "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh",
    "Nuh", "Palwal", "Panchkula", "Panipat", "Rewari", "Rohtak", "Sirsa",
    "Sonipat", "Yamunanagar"
  ],
  "Himachal Pradesh": [
    "Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur", "Kullu",
    "Lahaul and Spiti", "Mandi", "Shimla", "Sirmaur", "Solan", "Una"
  ],
  Jharkhand: [
    "Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum",
    "Garhwa", "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamtara",
    "Khunti", "Koderma", "Latehar", "Lohardaga", "Pakur", "Palamu",
    "Ramgarh", "Ranchi", "Sahebganj", "Seraikela Kharsawan", "Simdega", "West Singhbhum"
  ],
  Karnataka: [
    "Ramanagara", "Tumakuru", "Bengaluru Urban", "Bengaluru Rural", "Bagalkote",
    "Ballari", "Belagavi", "Bidar", "Chamarajanagar", "Chikkaballapura",
    "Chikkamagaluru", "Chitradurga", "Dakshina Kannada", "Davanagere", "Dharwad",
    "Gadag", "Hassan", "Haveri", "Kalaburagi", "Kodagu", "Kolar", "Koppal",
    "Mandya", "Mysuru", "Raichur", "Shivamogga", "Udupi", "Uttara Kannada",
    "Vijayapura", "Yadgir", "Vijayanagara"
  ],
  Kerala: [
    "Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam",
    "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta",
    "Thiruvananthapuram", "Thrissur", "Wayanad"
  ],
  "Madhya Pradesh": [
    "Agar Malwa", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", "Barwani",
    "Betul", "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara",
    "Damoh", "Datia", "Dewas", "Dhar", "Dindori", "Guna", "Gwalior", "Harda",
    "Hoshangabad", "Indore", "Jabalpur", "Jhabua", "Katni", "Khandwa",
    "Khargone", "Mandla", "Mandsaur", "Morena", "Narsinghpur", "Neemuch",
    "Panna", "Raisen", "Rajgarh", "Ratlam", "Rewa", "Sagar", "Satna",
    "Sehore", "Seoni", "Shahdol", "Shajapur", "Sheopur", "Shivpuri",
    "Sidhi", "Singrauli", "Tikamgarh", "Ujjain", "Umaria", "Vidisha"
  ],
  Maharashtra: [
    "Ahmednagar", "Akola", "Amravati", "Chhatrapati Sambhajinagar", "Beed",
    "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia",
    "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City",
    "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Dharashiv",
    "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara",
    "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"
  ],
  Manipur: [
    "Bishnupur", "Chandel", "Churachandpur", "Imphal East", "Imphal West",
    "Jiribam", "Kakching", "Kamjong", "Kangpokpi", "Noney", "Pherzawl",
    "Senapati", "Tamenglong", "Tengnoupal", "Thoubal", "Ukhrul"
  ],
  Meghalaya: [
    "East Garo Hills", "East Jaintia Hills", "East Khasi Hills",
    "Eastern West Khasi Hills", "North Garo Hills", "Ri Bhoi",
    "South Garo Hills", "South West Garo Hills", "South West Khasi Hills",
    "West Garo Hills", "West Jaintia Hills", "West Khasi Hills"
  ],
  Mizoram: [
    "Aizawl", "Champhai", "Hnahthial", "Khawzawl", "Kolasib", "Lawngtlai",
    "Lunglei", "Mamit", "Saitual", "Serchhip", "Siaha"
  ],
  Nagaland: [
    "Chumoukedima", "Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung",
    "Mon", "Niuland", "Noklak", "Peren", "Phek", "Shamator", "Tseminyu",
    "Tuensang", "Wokha", "Zunheboto"
  ],
  Odisha: [
    "Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack",
    "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur",
    "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar",
    "Khordha", "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh",
    "Nuapada", "Puri", "Rayagada", "Sambalpur", "Subarnapur", "Sundargarh"
  ],
  Punjab: [
    "Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib",
    "Fazilka", "Ferozepur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala",
    "Ludhiana", "Malerkotla", "Mansa", "Moga", "Muktsar", "Pathankot",
    "Patiala", "Rupnagar", "Sahibzada Ajit Singh Nagar", "Sangrur",
    "Shahid Bhagat Singh Nagar", "Tarn Taran"
  ],
  Rajasthan: [
    "Barmer", "Dausa", "Ajmer", "Alwar", "Banswara", "Baran", "Bharatpur",
    "Bhilwara", "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dholpur",
    "Dungarpur", "Hanumangarh", "Jaipur", "Jaisalmer", "Jalore", "Jhalawar",
    "Jhunjhunu", "Jodhpur", "Karauli", "Kota", "Nagaur", "Pali", "Pratapgarh",
    "Rajsamand", "Sawai Madhopur", "Sikar", "Sirohi", "Sri Ganganagar",
    "Tonk", "Udaipur"
  ],
  Sikkim: [
    "Gangtok", "Gyalshing", "Pakyong", "Soreng", "Namchi", "Mangan"
  ],
  "Tamil Nadu": [
    "Dharmapuri", "Madurai", "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore",
    "Cuddalore", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", "Kanyakumari",
    "Karur", "Krishnagiri", "Mayiladuthurai", "Nagapattinam", "Namakkal",
    "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet",
    "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni", "Thoothukudi",
    "Tiruchirappalli", "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvallur",
    "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"
  ],
  Telangana: [
    "Adilabad", "Bhadradri Kothagudem", "Hanamkonda", "Hyderabad", "Jagtial",
    "Jangaon", "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy",
    "Karimnagar", "Khammam", "Kumuram Bheem Asifabad", "Mahabubabad",
    "Mahabubnagar", "Mancherial", "Medak", "Medchal-Malkajgiri", "Mulugu",
    "Nagarkurnool", "Nalgonda", "Narayanpet", "Nirmal", "Nizamabad",
    "Peddapalli", "Rajanna Sircilla", "Ranga Reddy", "Sangareddy", "Siddipet",
    "Suryapet", "Vikarabad", "Wanaparthy", "Warangal", "Yadadri Bhuvanagiri"
  ],
  Tripura: [
    "Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala",
    "South Tripura", "Unakoti", "West Tripura"
  ],
  "Uttar Pradesh": [
    "Bahraich", "Varanasi", "Agra", "Aligarh", "Ambedkar Nagar", "Amethi",
    "Amroha", "Auraiya", "Ayodhya", "Azamgarh", "Baghpat", "Ballia",
    "Balrampur", "Banda", "Barabanki", "Bareilly", "Basti", "Bhadohi",
    "Bijnor", "Budaun", "Bulandshahr", "Chandauli", "Chitrakoot", "Deoria",
    "Etah", "Etawah", "Farrukhabad", "Fatehpur", "Firozabad", "Gautam Buddha Nagar",
    "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur", "Hapur",
    "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj",
    "Kanpur Dehat", "Kanpur Nagar", "Kasganj", "Kaushambi", "Kheri",
    "Kushinagar", "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri",
    "Mathura", "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar",
    "Pilibhit", "Pratapgarh", "Prayagraj", "Raebareli", "Rampur", "Saharanpur",
    "Sambhal", "Sant Kabir Nagar", "Shahjahanpur", "Shamli", "Shrawasti",
    "Siddharthnagar", "Sitapur", "Sonbhadra", "Sultanpur", "Unnao"
  ],
  Uttarakhand: [
    "Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar",
    "Nainital", "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal",
    "Udham Singh Nagar", "Uttarkashi"
  ],
  "West Bengal": [
    "Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Dakshin Dinajpur",
    "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri", "Jhargram", "Kalimpong",
    "Kolkata", "Malda", "Murshidabad", "Nadia", "North 24 Parganas",
    "Paschim Bardhaman", "Paschim Medinipur", "Purba Bardhaman",
    "Purba Medinipur", "Purulia", "South 24 Parganas", "Uttar Dinajpur"
  ],
  // Union Territories
  "Andaman and Nicobar Islands": [
    "Nicobar", "North and Middle Andaman", "South Andaman"
  ],
  Chandigarh: ["Chandigarh"],
  "Dadra and Nagar Haveli and Daman and Diu": [
    "Daman", "Diu", "Dadra and Nagar Haveli"
  ],
  Delhi: [
    "Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi",
    "North West Delhi", "Shahdara", "South Delhi", "South East Delhi",
    "South West Delhi", "West Delhi"
  ],
  "Jammu and Kashmir": [
    "Anantnag", "Bandipora", "Baramulla", "Budgam", "Doda", "Ganderbal",
    "Jammu", "Kathua", "Kishtwar", "Kulgam", "Kupwara", "Poonch", "Pulwama",
    "Rajouri", "Ramban", "Reasi", "Samba", "Shopian", "Srinagar", "Udhampur"
  ],
  Ladakh: ["Kargil", "Leh"],
  Lakshadweep: ["Lakshadweep"],
  Puducherry: ["Karaikal", "Mahe", "Puducherry", "Yanam"]
};

/**
 * Common regional and historical aliases for Indian cities and districts.
 * Maps informal/historical names to canonical (State, District).
 */
export const LOCATION_ALIASES: Record<string, { state: string; district: string }> = {
  // Karnataka
  ramanagara: { state: "Karnataka", district: "Ramanagara" },
  ramnagar: { state: "Karnataka", district: "Ramanagara" },
  "ರಾಮನಗರ": { state: "Karnataka", district: "Ramanagara" },
  "रामनगर": { state: "Karnataka", district: "Ramanagara" },
  tumakuru: { state: "Karnataka", district: "Tumakuru" },
  tumkur: { state: "Karnataka", district: "Tumakuru" },
  "ತುಮಕೂರು": { state: "Karnataka", district: "Tumakuru" },
  "तुमकुर": { state: "Karnataka", district: "Tumakuru" },
  bangalore: { state: "Karnataka", district: "Bengaluru Urban" },
  "bangalore urban": { state: "Karnataka", district: "Bengaluru Urban" },
  "bangalore rural": { state: "Karnataka", district: "Bengaluru Rural" },
  bengaluru: { state: "Karnataka", district: "Bengaluru Urban" },
  "bengaluru urban": { state: "Karnataka", district: "Bengaluru Urban" },
  "bengaluru rural": { state: "Karnataka", district: "Bengaluru Rural" },
  "ಬೆಂಗಳೂರು": { state: "Karnataka", district: "Bengaluru Urban" },
  "बेंगलुरु": { state: "Karnataka", district: "Bengaluru Urban" },
  "बैंगलोर": { state: "Karnataka", district: "Bengaluru Urban" },
  mysore: { state: "Karnataka", district: "Mysuru" },
  mysuru: { state: "Karnataka", district: "Mysuru" },
  "ಮೈಸೂರು": { state: "Karnataka", district: "Mysuru" },
  belgaum: { state: "Karnataka", district: "Belagavi" },
  belagavi: { state: "Karnataka", district: "Belagavi" },
  bellary: { state: "Karnataka", district: "Ballari" },
  ballari: { state: "Karnataka", district: "Ballari" },
  gulbarga: { state: "Karnataka", district: "Kalaburagi" },
  kalaburagi: { state: "Karnataka", district: "Kalaburagi" },
  hubli: { state: "Karnataka", district: "Dharwad" },
  dharwad: { state: "Karnataka", district: "Dharwad" },
  mangalore: { state: "Karnataka", district: "Dakshina Kannada" },
  mangaluru: { state: "Karnataka", district: "Dakshina Kannada" },
  shimoga: { state: "Karnataka", district: "Shivamogga" },
  shivamogga: { state: "Karnataka", district: "Shivamogga" },

  // Uttar Pradesh
  bahraich: { state: "Uttar Pradesh", district: "Bahraich" },
  "बहराइच": { state: "Uttar Pradesh", district: "Bahraich" },
  "ಬಹ್ರೈಚ್": { state: "Uttar Pradesh", district: "Bahraich" },
  varanasi: { state: "Uttar Pradesh", district: "Varanasi" },
  banaras: { state: "Uttar Pradesh", district: "Varanasi" },
  kashi: { state: "Uttar Pradesh", district: "Varanasi" },
  benares: { state: "Uttar Pradesh", district: "Varanasi" },
  "वाराणसी": { state: "Uttar Pradesh", district: "Varanasi" },
  "बनारस": { state: "Uttar Pradesh", district: "Varanasi" },
  "काशी": { state: "Uttar Pradesh", district: "Varanasi" },
  "ವಾರಣಾಸಿ": { state: "Uttar Pradesh", district: "Varanasi" },
  allahabad: { state: "Uttar Pradesh", district: "Prayagraj" },
  prayagraj: { state: "Uttar Pradesh", district: "Prayagraj" },
  "इलाहाबाद": { state: "Uttar Pradesh", district: "Prayagraj" },
  "प्रयागराज": { state: "Uttar Pradesh", district: "Prayagraj" },
  faizabad: { state: "Uttar Pradesh", district: "Ayodhya" },
  ayodhya: { state: "Uttar Pradesh", district: "Ayodhya" },
  lucknow: { state: "Uttar Pradesh", district: "Lucknow" },
  "लखनऊ": { state: "Uttar Pradesh", district: "Lucknow" },
  kanpur: { state: "Uttar Pradesh", district: "Kanpur Nagar" },
  "कानपुर": { state: "Uttar Pradesh", district: "Kanpur Nagar" },
  noida: { state: "Uttar Pradesh", district: "Gautam Buddha Nagar" },

  // Rajasthan
  barmer: { state: "Rajasthan", district: "Barmer" },
  "बाड़मेर": { state: "Rajasthan", district: "Barmer" },
  "ಬಾರ್ಮರ್": { state: "Rajasthan", district: "Barmer" },
  dausa: { state: "Rajasthan", district: "Dausa" },
  "दौसा": { state: "Rajasthan", district: "Dausa" },
  "ದೌಸಾ": { state: "Rajasthan", district: "Dausa" },
  jaipur: { state: "Rajasthan", district: "Jaipur" },
  "जयपुर": { state: "Rajasthan", district: "Jaipur" },
  jodhpur: { state: "Rajasthan", district: "Jodhpur" },
  "जोधपुर": { state: "Rajasthan", district: "Jodhpur" },
  udaipur: { state: "Rajasthan", district: "Udaipur" },

  // Tamil Nadu
  dharmapuri: { state: "Tamil Nadu", district: "Dharmapuri" },
  "தருமபுரி": { state: "Tamil Nadu", district: "Dharmapuri" },
  "धर्मपुरी": { state: "Tamil Nadu", district: "Dharmapuri" },
  "ಧರ್ಮಪುರಿ": { state: "Tamil Nadu", district: "Dharmapuri" },
  madurai: { state: "Tamil Nadu", district: "Madurai" },
  "மதுரை": { state: "Tamil Nadu", district: "Madurai" },
  "मदुरै": { state: "Tamil Nadu", district: "Madurai" },
  "ಮಧುರೈ": { state: "Tamil Nadu", district: "Madurai" },
  madras: { state: "Tamil Nadu", district: "Chennai" },
  chennai: { state: "Tamil Nadu", district: "Chennai" },
  "சென்னை": { state: "Tamil Nadu", district: "Chennai" },
  trichy: { state: "Tamil Nadu", district: "Tiruchirappalli" },
  tiruchirappalli: { state: "Tamil Nadu", district: "Tiruchirappalli" },
  coimbatore: { state: "Tamil Nadu", district: "Coimbatore" },
  "கோவை": { state: "Tamil Nadu", district: "Coimbatore" },

  // Goa
  panaji: { state: "Goa", district: "North Goa" },
  panjim: { state: "Goa", district: "North Goa" },
  anjuna: { state: "Goa", district: "North Goa" },
  mapusa: { state: "Goa", district: "North Goa" },
  calangute: { state: "Goa", district: "North Goa" },
  "north goa": { state: "Goa", district: "North Goa" },
  margao: { state: "Goa", district: "South Goa" },
  madgaon: { state: "Goa", district: "South Goa" },
  vasco: { state: "Goa", district: "South Goa" },
  "south goa": { state: "Goa", district: "South Goa" },

  // Maharashtra
  bombay: { state: "Maharashtra", district: "Mumbai City" },
  mumbai: { state: "Maharashtra", district: "Mumbai City" },
  "मुंबई": { state: "Maharashtra", district: "Mumbai City" },
  poona: { state: "Maharashtra", district: "Pune" },
  pune: { state: "Maharashtra", district: "Pune" },
  "पुणे": { state: "Maharashtra", district: "Pune" },
  nagpur: { state: "Maharashtra", district: "Nagpur" },
  aurangabad: { state: "Maharashtra", district: "Chhatrapati Sambhajinagar" },

  // West Bengal
  calcutta: { state: "West Bengal", district: "Kolkata" },
  kolkata: { state: "West Bengal", district: "Kolkata" },
  "कोलकाता": { state: "West Bengal", district: "Kolkata" },

  // Delhi
  delhi: { state: "Delhi", district: "New Delhi" },
  "new delhi": { state: "Delhi", district: "New Delhi" },
  "नई दिल्ली": { state: "Delhi", district: "New Delhi" },

  // Telangana
  hyderabad: { state: "Telangana", district: "Hyderabad" },
  "हैदराबाद": { state: "Telangana", district: "Hyderabad" },
  secunderabad: { state: "Telangana", district: "Hyderabad" },

  // Haryana
  gurgaon: { state: "Haryana", district: "Gurugram" },
  gurugram: { state: "Haryana", district: "Gurugram" },

  // Kerala
  trivandrum: { state: "Kerala", district: "Thiruvananthapuram" },
  thiruvananthapuram: { state: "Kerala", district: "Thiruvananthapuram" },
  cochin: { state: "Kerala", district: "Ernakulam" },
  kochi: { state: "Kerala", district: "Ernakulam" },
  ernakulam: { state: "Kerala", district: "Ernakulam" },
  calicut: { state: "Kerala", district: "Kozhikode" },
  kozhikode: { state: "Kerala", district: "Kozhikode" },

  // Bihar
  patna: { state: "Bihar", district: "Patna" },
  "पटना": { state: "Bihar", district: "Patna" },

  // Gujarat
  ahmedabad: { state: "Gujarat", district: "Ahmedabad" },
  amdavad: { state: "Gujarat", district: "Ahmedabad" },
  surat: { state: "Gujarat", district: "Surat" },
  baroda: { state: "Gujarat", district: "Vadodara" },
  vadodara: { state: "Gujarat", district: "Vadodara" }
};

/**
 * Checks whether a given state and district combination is in the 8 pilot districts.
 */
export function isPilotDistrict(state?: string | null, district?: string | null): boolean {
  if (!state || !district) return false;
  const normState = state.trim().toLowerCase();
  const normDist = district.trim().toLowerCase();

  for (const [pilotState, pilotDistricts] of Object.entries(PILOT_STATES_AND_DISTRICTS)) {
    if (pilotState.toLowerCase() === normState) {
      return pilotDistricts.some((d) => d.toLowerCase() === normDist);
    }
  }
  return false;
}

/**
 * Normalizes a state name string to its canonical Indian State/UT name.
 */
export function findCanonicalState(stateStr?: string | null): string | null {
  if (!stateStr || typeof stateStr !== "string") return null;
  const clean = stateStr.trim().toLowerCase();
  if (!clean) return null;

  for (const state of ALL_INDIAN_STATES) {
    if (state.toLowerCase() === clean) return state;
  }
  for (const state of ALL_INDIAN_STATES) {
    if (clean.length >= 4 && state.toLowerCase().includes(clean)) return state;
  }
  return null;
}

export interface GeographicValidationResult {
  isValid: boolean;
  state?: string;
  district?: string;
  isPilot: boolean;
  message?: string;
}

/**
 * Resolves and validates a district and optional state across India.
 * 100% deterministic lookup. Never defaults to Ramanagara.
 */
export function resolveIndianLocation(
  districtInput?: string | null,
  stateInput?: string | null
): GeographicValidationResult {
  const cleanDistrict = districtInput && typeof districtInput === "string" ? districtInput.trim() : "";
  const cleanState = stateInput && typeof stateInput === "string" ? stateInput.trim() : "";

  if (!cleanDistrict) {
    const canonicalState = findCanonicalState(cleanState);
    return {
      isValid: false,
      state: canonicalState || cleanState || undefined,
      district: undefined,
      isPilot: false,
      message: "District is required. Please specify your district."
    };
  }

  const distLower = cleanDistrict.toLowerCase();

  // 1. Check known aliases (e.g. Bangalore -> Bengaluru Urban, Banaras -> Varanasi, Anjuna -> North Goa)
  const aliasMatch = LOCATION_ALIASES[distLower];
  if (aliasMatch) {
    // If stateInput is provided, check if it matches the alias state
    if (cleanState) {
      const canonProvidedState = findCanonicalState(cleanState) || cleanState;
      if (canonProvidedState.toLowerCase() !== aliasMatch.state.toLowerCase()) {
        return {
          isValid: false,
          state: canonProvidedState,
          district: cleanDistrict,
          isPilot: false,
          message: `State "${cleanState}" does not match district "${aliasMatch.district}" (${aliasMatch.district} is in ${aliasMatch.state}).`
        };
      }
    }

    const isPilot = isPilotDistrict(aliasMatch.state, aliasMatch.district);
    return {
      isValid: true,
      state: aliasMatch.state,
      district: aliasMatch.district,
      isPilot,
      message: isPilot
        ? undefined
        : `District "${aliasMatch.district}" is outside current pilot analytics coverage.`
    };
  }

  // 2. If state is provided, check against that state's districts
  if (cleanState) {
    const canonicalState = findCanonicalState(cleanState);
    if (!canonicalState) {
      return {
        isValid: false,
        state: cleanState,
        district: cleanDistrict,
        isPilot: false,
        message: `State or territory "${cleanState}" is not recognized as a valid Indian State or Union Territory.`
      };
    }

    const stateDistricts = INDIAN_DISTRICTS_BY_STATE[canonicalState] || [];
    const directMatch = stateDistricts.find(
      (d) => d.toLowerCase() === distLower || d.toLowerCase().replace(/\s+/g, "") === distLower.replace(/\s+/g, "")
    );

    if (directMatch) {
      const isPilot = isPilotDistrict(canonicalState, directMatch);
      return {
        isValid: true,
        state: canonicalState,
        district: directMatch,
        isPilot,
        message: isPilot
          ? undefined
          : `District "${directMatch}" is outside current pilot analytics coverage.`
      };
    }

    // Check if district actually belongs to a DIFFERENT state (e.g. Goa + Ramanagara)
    for (const [otherState, otherDistricts] of Object.entries(INDIAN_DISTRICTS_BY_STATE)) {
      if (otherState.toLowerCase() === canonicalState.toLowerCase()) continue;
      const foundInOther = otherDistricts.find(
        (d) => d.toLowerCase() === distLower || d.toLowerCase().replace(/\s+/g, "") === distLower.replace(/\s+/g, "")
      );
      if (foundInOther) {
        return {
          isValid: false,
          state: canonicalState,
          district: cleanDistrict,
          isPilot: false,
          message: `State "${canonicalState}" does not match district "${foundInOther}" (${foundInOther} is in ${otherState}).`
        };
      }
    }

    // Allow user-entered district for that state if it has reasonable syntax
    if (cleanDistrict.length >= 2 && !/^[0-9]+$/.test(cleanDistrict)) {
      return {
        isValid: true,
        state: canonicalState,
        district: cleanDistrict,
        isPilot: false,
        message: `District "${cleanDistrict}" is outside current pilot analytics coverage.`
      };
    }

    return {
      isValid: false,
      state: canonicalState,
      district: cleanDistrict,
      isPilot: false,
      message: `District "${cleanDistrict}" is not recognized in ${canonicalState}.`
    };
  }

  // 3. No state provided: search across all states to identify where this district belongs
  for (const [state, districts] of Object.entries(INDIAN_DISTRICTS_BY_STATE)) {
    const match = districts.find(
      (d) => d.toLowerCase() === distLower || d.toLowerCase().replace(/\s+/g, "") === distLower.replace(/\s+/g, "")
    );
    if (match) {
      const isPilot = isPilotDistrict(state, match);
      return {
        isValid: true,
        state,
        district: match,
        isPilot,
        message: isPilot
          ? undefined
          : `District "${match}" is outside current pilot analytics coverage.`
      };
    }
  }

  // Unrecognized district without state
  return {
    isValid: false,
    district: cleanDistrict,
    isPilot: false,
    message: `District "${cleanDistrict}" was not recognized. Please select your State and District.`
  };
}
