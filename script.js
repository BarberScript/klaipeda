const supabaseUrl = "https://vfzyenkbmccasevhgypr.supabase.co";
const supabaseKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmenllbmtibWNjYXNldmhneXByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDY1NTAyMDUsImV4cCI6MjAyMjEyNjIwNX0.DHkrqOGJjb4QAXaqayUfis4CtPjBW-0cnzDYg3IGubc";

const { createClient } = supabase;
const supabaseClient = createClient(supabaseUrl, supabaseKey);

// Отображение результатов при загрузке страницы
displayResults();

async function saveDataToSupabase(
    sum,
    hours,
    result,
    com,
    additionalValue,
    hourlySalary,
    additionalResult,
    additionalBrut,
    additionalNalog
) {
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleString();

    const { data, error } = await supabaseClient.from("peon").upsert([
        {
            sum,
            hours,
            result,
            com,
            hourlySalary,
            additionalValue,
            date: formattedDate,
            ADtotal: additionalResult,
            ADbrut: additionalBrut,
            ADnalog: additionalNalog,
            bigtotal: hourlySalary + additionalNalog,
        },
    ]);

    if (error) {
        console.error("Error saving data to Supabase:", error.message);
        alert("An error occurred while saving data to the database.");
    } else {
        // Дополнительные действия при успешном сохранении данных
    }
}

function showError() {
    const inputs = document.querySelectorAll("input");

    inputs.forEach(function (input) {
        input.style.backgroundColor = "red";
    });
}

async function calculateSalary() {
    const sumInput = document.getElementById("sum").value;
    const hoursInput = document.getElementById("hours").value;
    const additionalValueInput = document.getElementById("additionalValue").value;

    const sum = parseFloat(sumInput);
    const hours = parseFloat(hoursInput);
    const additionalValue = parseFloat(additionalValueInput);

    if (isNaN(sum) || isNaN(hours) || isNaN(additionalValue)) {
        showError();
        return;
    }

    // Выполняем существующие формулы расчёта
    let brut, result, com;

    if (sum === 0 && hours === 0) {
        brut = 38.5 * 15.75;
        result = brut - 0.21 * brut;
        com = 0;
    } else {
        const y = hours * 15.75;
        const z = y * 2;
        const t = sum - z;
        com = t - 0.6 * t;
        const w = com + y;
        brut = w;
        result = w - 0.21 * w;
    }

    // Добавляем дополнительное значение к результату и brut
    const additionalResult = additionalValue + result;
    const additionalBrut = additionalValue + brut;

    // Вычисляем дополнительные значения по формуле
    const additionalNalog = additionalValue + 0.21 * brut + result;

    // Вычисляем часовую зарплату
    let hourlySalary;
    if (sum === 0 && hours === 0) {
        hourlySalary = 15.75;
    } else {
        hourlySalary = hours !== 0 ? brut / hours : 0;
    }

    if (!isFinite(hourlySalary)) {
        hourlySalary = 0;
    }

    // Сохранение данных в базу данных Supabase
    await saveDataToSupabase(
        sum,
        hours,
        result,
        com,
        additionalValue,
        hourlySalary,
        additionalResult,
        additionalBrut,
        additionalNalog
    );
    await fetchResults();

    // После сохранения данных и получения новых данных из базы данных перезагружаем результаты и обновляем график
    displayResults();
}
// Получение элементов DOM
const resultsList = document.getElementById("resultsList");
const hourlySalaryResult = document.getElementById("hourlySalaryResult");

// Функция для отображения результатов
async function displayResults() {
    try {
        // Получение данных из базы данных Supabase
        const { data, error } = await supabaseClient
            .from("peon")
            .select("*")
            .order("id", { ascending: false })
            .limit(3);

        if (error) {
            console.error("Supabase:", error.message);
            showError();
            return;
        }

        // Очистка списка перед обновлением
        resultsList.innerHTML = "";
        resultsList2.innerHTML = ""; // Добавлено для второго списка
        resultsList3.innerHTML = "";

        // Вывод результатов в список
        data.forEach((entry, index) => {
            const listItem = document.createElement("li");

            // Добавление стиля для второй записи
            if (index === 1) {
                listItem.classList.add("blueunderline");
            } else {
                listItem.classList.add("redunderline");
            }

            // Формирование содержимого элемента списка
            listItem.innerHTML = `<strong>La casse</strong>: ${
                entry.sum
            }, <strong>Les heures</strong>: ${
                entry.hours
            }      <br><strong>La commission</strong>: ${entry.com.toFixed(2)}
      <br><strong>Le salaire</strong>: ${entry.result.toFixed(2)}
      <br><strong>La somme totale</strong>: ${entry.ADtotal.toFixed(2)}`;

            if (index < 1) {
                resultsList.appendChild(listItem);
            } else if (index < 2) {
                const listItem2 = listItem.cloneNode(true); // Создание копии элемента
                resultsList2.appendChild(listItem2); // Добавление копии во второй список
            } else {
                const listItem3 = listItem.cloneNode(true); // Создание копии элемента
                resultsList3.appendChild(listItem3); // Добавление копии в третий список
            }
        });
    } catch (error) {
        console.error("Error:", error.message);
        showError();
    }
}



async function fetchResults() {
    const { data, error } = await supabaseClient
        .from("peon")
        .select("sum, hours, result, date, ADtotal, additionalValue")
        .order("id", { ascending: false }) // Сортировка по ID в порядке возрастания
        .limit(10);

    if (error) {
        console.error("Error fetching data from Supabase:", error.message);
    }
}



window.onload = function () {
    fetchResults();
};
