// let m = document.getElementById("male")
// let f = document.getElementById("female")




// function clickedFemale(){
//     y.style.color ="black"
// }

// function clickedMale(){
// m.style.color ="black"
// }


let proteinIndex = 0
let fatIndex = 1
let carbIndex = 2
let alcoholIndex = 4

let gender = "male"
let weight = 0
let age = 0
let height = 0

/*let weightTop = 65
let ageTop = 68

let weightBottom = 87.5
let ageBottom = 57.5*/

let bmr = 0
let totalCalories = 0;
let totalExpectancy = 0;

const params = {
    api_key: "giR1A5hRkVLghxKFURDX5eByksvom10OmafNDzJ2",
    query: "",
    dataType: ["Survey (FNDDS)"],
    pageSize: 1,
}

function _getData(queryLink){
    return fetch(queryLink)
    .then(response => response.json())
}

function _getCalories(protein, carb, fat, alcohol) {
    let calTotal = (protein * 4) + (carb * 4) + (fat * 9) + (alcohol * 7);
    return calTotal;
}

function _getExpectancy(weightKg){
    return (-0.46 * weightKg) + 98.3
}

function _bmrCalc (gender, weightKg, heightCm, age, active) {
    let bmr = 0;
    if (gender == "male") {
        bmr = 88.362 + (13.397 * weightKg) + (4.799 * heightCm) - (5.677 * age);
    }
    else {
        bmr = 447.593 + (9.247 * weightKg) + (3.098 * heightCm) - (4.330 * age);
    }
    return bmr * active;
}

function _bmiCalc(weightKg, heightCm){
    let heightM = (heightCm / 100)
    let bmi = weightKg / (heightM * heightM)
    return bmi
}

function _weightGain(totalCalories, bmr) {
    let excessCalories = totalCalories - bmr;
    let weightGain = excessCalories * 0.00014286;
    return weightGain * 3;
}

function _yearsOffLife(bmiArray) {
    let bmiIncrease = bmiArray[bmiArray.length - 1] - bmiArray[bmiArray.length - 2];
    let monthsOff = bmiIncrease * 7;
    let yearsOff = monthsOff / 12;
    return yearsOff;
}

function _repeatYear() {
    let original = _getExpectancy(weight);
    let lifeExpectancy = original;
    const bmiArray = [];
    bmiArray.push(_bmiCalc(weight, height));
    while (age <= lifeExpectancy && age < 100) {
        weight += _weightGain(totalCalories, bmr); // yearly weight gain
        bmiArray.push(_bmiCalc(weight, height));
        lifeExpectancy -= _yearsOffLife(bmiArray);
        age++;
    }

    totalExpectancy = lifeExpectancy
    if (original - lifeExpectancy > 0){
        let finalNumber = Math.round(original - lifeExpectancy)
        return `At this rate, you cut ${finalNumber} years off your life expectancy.`;
    } else {
        let finalNumber = -Math.round(original - lifeExpectancy)
        return `At this rate, you will add ${finalNumber} years to your life expectancy.`;
    }
}

function submitFood(){
    let textbox = document.querySelector("#text-input")
    let fullText = textbox.value
    let splitArray = fullText.split(", ")

    let weightBox = document.querySelector("#weight-input")
    let ageBox = document.querySelector("#age-input")
    let heightBox = document.querySelector("#height-input")
    weight = Number(weightBox.value) || 160
    age = Number(ageBox.value) || 16
    height = Number(heightBox.value) || 5.5

    weight *= 0.453592
    height *= 30.48


    bmr = _bmrCalc(gender, weight, height, age, 1.2) // FINAL VALUES IS HOW ACTIVE THEY ARE, INCREASE FOR MORE ACTIVE

    allPromises = []
    for (const name of splitArray){
        params.query = name
        let queryLink = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${encodeURIComponent(params.api_key)}&query=${encodeURIComponent(name)}&dataType=${encodeURIComponent(params.dataType)}&pageSize=${encodeURIComponent(params.pageSize)}`
        let promise = _getData(queryLink)
        allPromises.push(promise)
        promise.then(function(res) {
            if (res && res.foods && res.foods[0] && res.foods[0].foodNutrients){
                let nutrients = res.foods[0].foodNutrients
                let protein = nutrients[proteinIndex].value
                let fat = nutrients[fatIndex].value
                let carb = nutrients[carbIndex].value
                let alcohol = nutrients[alcoholIndex].value
                totalCalories += _getCalories(protein, carb, fat, alcohol)
                return true
            }
            return false
        })
    }
    
    Promise.all(allPromises).then(() => {
        let text = document.querySelector("#completed-text")
        let totalLabel = document.querySelector("#estimated-life")
        let off = _repeatYear()
        text.innerHTML = off
        totalLabel.innerHTML = `Your estimated life expectancy is ${Math.round(totalExpectancy)} years.`
        totalCalories = 0
    })

}

function clickedMale(){
    gender = "male"
    document.querySelector("#male").style.color = "black"
    document.querySelector("#female").style.color = "gray"
}

function clickedFemale(){
    gender = "female"
    document.querySelector("#male").style.color = "gray"
    document.querySelector("#female").style.color = "black"
}



