const countriesContainer = document.getElementById('countriesContainer');
const searchInput = document.getElementById('searchInput'); // افترض عندك input في HTML للبحث

const controller = new AbortController(); // ده اللي هيستخدم لل abort
const { signal } = controller;

async function getCountryData(countryName) {
  const controller = new AbortController(); // جديد لكل طلب
  const { signal } = controller;

  try {
    const response = await fetch(`https://restcountries.com/v2/name/${countryName}`, { signal });
   
    {/* 
     كده انا هنا فهمته ان ال 
    data دي عبارة عن 
    array  عشان كده حطيت ال 
    [data]
  */ }
  
    const [data] = await response.json();

    const html = `
      <div class="country card">
        <img src="${data.flag}" alt="Flag of ${data.name}" />
        <h2>${data.name}</h2>
        <p>Region: ${data.region}</p>
        <p>Population: ${(data.population / 1_000_000).toFixed(1)} M</p>
        <p>Language: ${data.languages[0].name}</p>
        <p>Currency: ${data.currencies[0].name}</p>
      </div>
    `;

    {/* 
    ركز معايا هنا علشان ده حاجه اول مره اعرفها اصراحه يعني  
    ال insertAdjacentHTML
     ده احسن بكتير جدا من 
     
     innerHTML +=html 
     احسن في انه طبعا اسرع مبيعيدش بناء ال 
     dom
      كله وكويس جدا مع الصفحات الكبيرة 
      
      
      */ }
//countriesContainer.innerHTML += html;  // ده الطبيعي اللي كنت بمشي عليه 

    countriesContainer.insertAdjacentHTML("beforeend", html);//

    // بعد ما يخلص الطلب نقدر نعتبر الـ controller انتهى تلقائي
    // ومفيش حاجة إضافية نعملها لأنه مش مرتبط بأي شيء آخر
    return controller; // optional لو حابب تخزن للتحكم اليدوي
  } 
  catch (err) {
    if (err.name === 'AbortError') {
      console.log('Fetch request was aborted');
    } else {
      console.error(err);
    }
  }
}


/* --- INTERSECTION OBSERVER FOR ANIMATION --- */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.2,
});

function observeCards() {
  document.querySelectorAll(".card:not(.observed)").forEach(card => {
    card.classList.add("observed");
    observer.observe(card);
  });
}

const countries = ["Egypt","portugal","united states of america","germany","India","China","Australia","Brazil","Canada","France","japan","south africa","argentina","russia","mexico","italy","spain","sweden","norway","netherlands","switzerland","new zealand","saudi arabia","turkey","greece","thailand","indonesia","poland","belgium","austria","ireland","korea","finland","denmark","portugal","tunisia","venezuela","chile","colombia","philipinis","pakistan","bangladesh","iraq","iran","uae","qatar","kuwait","oman","morocco","algeria","tunisia","libya","sudan","ethiopia","kenya","uganda","tanzania","ghana","nigeria","ivory coast","senegal","cameroon","zimbabwe","zambia","malawi","botswana","namibia","madagascar","cuba","jamaica","haiti","dominican republic","panama","costa rica","guatemala","honduras","el salvador","nicaragua","bolivia","paraguay","uruguay","croatia","slovakia","slovenia","hungary","czech republic","bulgaria","romania","serbia","ukraine","belarus","lithuania","latvia","estonia"];

(async () => {
  for (const c of countries) {
    await getCountryData(c);
    observeCards();
  }
})();

// لو عايز تلغي كل الطلبات اللي شغالة في أي وقت ممكن تعمل
// controller.abort();
// وسهله بس انا مستخدمتهاش اصراحه 

/* 
هنا ياريس جزئية ال debounce اللي بعمل بيها search 
هنا الميزة يا معلم اللي علي ال debounce دي انها بتقلل عدد المرات اللي الفنكشن بتاع ال search بيتنادى فيها
يعني بدل ما كل ما المستخدم يكتب حرف في ال input الفنكشن بتتنادى على طول وده ممكن يسبب ضغط على السيرفر لو المستخدم بيكتب بسرعة
فانا بستخدم ال debounce عشان اخلي الفنكشن بتتنادى بعد فترة تأخير معينة من اخر مرة المستخدم كتب فيها حاجة
لو المستخدم كتب حاجة تاني قبل ما الفترة دي تخلص، التايمر بيتعاد من اول وجديد
وطبعا الميزة الاكبر لو انت فتحت ال network 
هتلاقي عندك عدد الريكويستات قلت لانك بدل ماهيجيلك في ريكويست الواحد 15 ريكويست هيجيلك وحد بس 
اصراحه اللي كان شرحها كان واحد اجنبي مش فاكر اسمه 
*/
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/* --- SEARCH COUNTRIES WITH DEBOUNCE --- */
const handleSearch = debounce(async () => {
  const query = searchInput.value.trim().toLowerCase();
  countriesContainer.innerHTML = ""; // مسح المحتوى الحالي
  if (query) {
    await getCountryData(query);
    observeCards();
  }
}, 500); // 500ms delay

searchInput.addEventListener("input", handleSearch);
