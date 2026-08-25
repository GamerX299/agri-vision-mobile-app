export type Disease = { id:string; en:string; ar:string; treatmentEn:string; treatmentAr:string };
export const diseases:Disease[] = [
{id:'Apple___Apple_scab',en:'Apple Scab',ar:'مرض جرب التفاح',treatmentEn:'Apply a suitable fungicide (Captan) and monitor humidity.',treatmentAr:'استخدم مبيداً فطرياً مناسباً (كابتان) وراقب الرطوبة.'},
{id:'Apple___Black_rot',en:'Apple Black Rot',ar:'التعفن الأسود في التفاح',treatmentEn:'Prune infected cankers and dispose of them outside the farm.',treatmentAr:'قلّم التقرحات المصابة وتخلّص منها خارج المزرعة.'},
{id:'Apple___Cedar_apple_rust',en:'Cedar Apple Rust',ar:'صدأ التفاح الجبلي',treatmentEn:'Remove nearby juniper hosts and apply rust fungicide.',treatmentAr:'أزل أشجار العرعر القريبة واستخدم مبيد صدأ.'},
{id:'Apple___healthy',en:'Healthy Apple Plant',ar:'نبتة تفاح سليمة',treatmentEn:'Crop healthy. Maintain standard irrigation and fertilization.',treatmentAr:'المحصول سليم. حافظ على الري والتسميد المعتادين.'},
{id:'Tomato___Bacterial_spot',en:'Tomato Bacterial Spot',ar:'البقعة البكتيرية في الطماطم',treatmentEn:'Apply copper-based bactericides; avoid overhead watering.',treatmentAr:'استخدم مبيدات بكتيرية نحاسية وتجنب الري العلوي.'},
{id:'Tomato___Early_blight',en:'Tomato Early Blight',ar:'الندوة المبكرة في الطماطم',treatmentEn:'Spray protective fungicide and prune lower leaves.',treatmentAr:'رش مبيداً فطرياً واقياً وقص الأوراق السفلية.'},
{id:'Tomato___healthy',en:'Healthy Tomato Plant',ar:'نبتة طماطم سليمة',treatmentEn:'Crop healthy. Continue your current management regimen.',treatmentAr:'المحصول سليم. واصل برنامج الإدارة الحالي.'},
{id:'Tomato___Late_blight',en:'Tomato Late Blight',ar:'الندوة المتأخرة في الطماطم',treatmentEn:'Isolate infected plants and apply systemic fungicides immediately.',treatmentAr:'اعزل النباتات المصابة واستخدم مبيدات جهازية فوراً.'},
{id:'Tomato___Leaf_Mold',en:'Tomato Leaf Mold',ar:'عفن الأوراق في الطماطم',treatmentEn:'Improve greenhouse airflow and reduce air humidity.',treatmentAr:'حسّن تدفق الهواء في البيوت المحمية وخفّض الرطوبة.'},
{id:'Tomato___Septoria_leaf_spot',en:'Tomato Septoria Leaf Spot',ar:'تبقع أوراق السبتوريا',treatmentEn:'Clear fallen leaves and use anti-Septoria fungicides.',treatmentAr:'أزل الأوراق المتساقطة واستخدم مبيداً مضاداً للسبتوريا.'},
{id:'Tomato___Spider_mites',en:'Two-Spotted Spider Mite',ar:'العنكبوت الأحمر ذو البقعتين',treatmentEn:'Spray dedicated acaricide under leaf surfaces.',treatmentAr:'رش مبيد أكاروس مخصصاً تحت أسطح الأوراق.'},
{id:'Tomato___Target_Spot',en:'Tomato Target Spot',ar:'مرض البقعة الهدفية في الطماطم',treatmentEn:'Apply systemic fungicides and optimize plant spacing.',treatmentAr:'استخدم مبيدات جهازية وحسّن المسافات بين النباتات.'},
{id:'Tomato___Tomato_mosaic_virus',en:'Tomato Mosaic Virus',ar:'فيروس موزايك الطماطم',treatmentEn:'Remove infected plants to halt spread; sanitize tools.',treatmentAr:'أزل النباتات المصابة لوقف الانتشار وعقّم الأدوات.'},
{id:'Tomato___Tomato_Yellow_Leaf_Curl_Virus',en:'Tomato Yellow Leaf Curl Virus',ar:'فيروس تجعد أوراق الطماطم الصفراء',treatmentEn:'Control whitefly vectors using sticky traps and insecticides.',treatmentAr:'كافح الذباب الأبيض بالمصائد اللاصقة والمبيدات.'}
];