// Dibawah ini controllers. Ubah value untuk kostumisasi game.
// Semua stats awal
const stats = {
    money: 0,   // uang mulai
    moneyup: 1, // nilai tambah uang saat click, awal
    autoclicker: 0, // jumlah autoclicker awal
    multiplier: 1, // jumlah multiplier awal
    upgrade: 0, // level upgrade awal. Maks tiga.
    prestige: 0, // persen prestige awal

    // multiplier saat upgrade belum dibeli
    up1: 1,
    up2: 1,
    up3: 1
};

const boost = {
    boostOn: false,
    minMul: 2,  // Minimal multiplier random
    maxMul: 5,  // Maximal multiplier random
    boostCountDownStart: 30, // jumlah waktu saat off, default
    boostCountDown: 30, // jumlah waktu saat off, awal
    boostIncr: 5,   // increment jumlah waktu saat off
    onCountdownStart: 5, // jumlah waktu saat on, default
    onCountdown: 5, // jumlah waktu saat on, awal
    onMultiplier: 1 // simpan variabel multiplier random
}

const prestige = {
    unlocked: false,
    prestigeIncr: 25, // persen prestige yang ditambah saat prestige dibeli
    prestigeCost: 100000, // harga prestige awal
    prestigeCostIncr: 100000 // harga prestige awal di tambah ini saat prestige dibeli
}

    // Cost =  Harga awal
    // Value = Jumlah yang ditambah ketika dibeli
    // Incr = Setelah beli, harga naik sesuai ini
    // Name = Teks yang ditampilkan
upgradeCost = [15000, 50000, 100000];
upgradeName = ["Rumah", "Kota", "Angkasa"];
upgradeMul = [2, 2, 2];

autoClickCostStart = [50, 200, 500];
autoClickCost = [50, 200, 500];
autoClickValue = [1, 2, 5];
autoClickIncr = [200, 500, 1000];

mulCostStart = [50, 100, 250];
mulCost = [50, 100, 250];
mulValue = [2, 3, 4];
mulIncr = [200, 500, 1000];

// Semua dibawah ini function. Hati-hati saat diubah!

// Saat page diload: 
// Pertama reload semua button. Lalu cek apa ada cookie. Cookie digunakan untuk menyimpan progress.
window.onload = function(){
    // Jika cookie ada
    if(document.cookie.search(/gamedata=/i) != -1){
        posStart = document.cookie.search(/gamedata=/i) + 9;
        posEnd = document.cookie.indexOf("]", posStart) + 1;
        gameDataStr = document.cookie.substring(posStart, posEnd);

        var gameDataArr = JSON.parse(gameDataStr);

        stats.money = gameDataArr[0];
        stats.moneyup = gameDataArr[1];
        stats.autoclicker = gameDataArr[2];
        stats.multiplier = gameDataArr[3];
        stats.upgrade = gameDataArr[4];
        stats.prestige = gameDataArr[5];

        boost.boostOn = gameDataArr[6];
        boost.boostCountDown = gameDataArr[7];
        boost.onCountdown = gameDataArr[8];
        boost.onMultiplier = gameDataArr[9];

        prestige.prestigeCost = gameDataArr[10];
    }

    if(stats.upgrade > 0) stats.up1 = upgradeMul[0];
    if(stats.upgrade > 1) stats.up2 = upgradeMul[1];
    if(stats.upgrade > 2) stats.up3 = upgradeMul[2];

    $("#menuUpgrade1").hide();
    $("#menuUpgrade2").hide();
    $("#menuUpgrade3").hide();

    checkBackgroundLevel();
    redrawButtons();
}

// Saat exit dari page, simpan cookie baru.
window.onunload = function(){
    // Format cookie:
    // document.cookie = "gamedata= [100, 1, 1, 1, 0, 0, false, 30, 10, 1, 10000]; SameSite=Lax;";
    document.cookie = "gamedata= ["
        + stats.money + ", " + stats.moneyup + ", " + stats.autoclicker + ", " + stats.multiplier + ", " + stats.upgrade + ", " +
        stats.prestige + ", " + boost.boostOn + ", " + boost.boostCountDown + ", " + boost.onCountdown + ", " + 
        boost.onMultiplier + ", " + prestige.prestigeCost + "]; SameSite=Lax;";
}

// Lakukan function ini setiap satu detik
setInterval(function(){
    // cek prestige

    
    if(stats.upgrade >= 3){
        prestige.unlocked = true;
    }

    if(prestige.unlocked){    
        document.getElementById("prestigeButton").innerHTML = "Cost: " + prestige.prestigeCost;
        if(stats.money >= prestige.prestigeCost){
            document.getElementById("prestigeButton").setAttribute("class", "btn btn-danger btn-sm ms-2");
            document.getElementById("prestigeButton").innerHTML = "BELI";
        }else{
            document.getElementById("prestigeButton").setAttribute("class", "btn btn-secondary btn-sm ms-2 disabled");
        }
    }else{
        document.getElementById("prestigeButton").setAttribute("class", "btn btn-secondary btn-sm ms-2 disabled");
        document.getElementById("prestigeButton").innerHTML = "DIKUNCI";
    }

    if(stats.autoclicker > 0){
        autoClicker();
    }
    redrawButtons();
    checkIfLockedUnlocked();
    refreshMoneyDisplay();
}, 1000);

// Timer booster
setInterval(function(){
    console.log(boost.boostOn);
    if(boost.boostOn == false){
        if(boost.boostCountDown > 0){
            boost.boostCountDown--;
            document.getElementById("boosterDisplay").innerHTML = "Random Booster (" + boost.boostCountDown + "s):";
        }
        if(boost.boostCountDown <= 0){
            document.getElementById("boosterButton").setAttribute("class", "btn btn-warning btn-sm ms-2");
        }
    }else{
        if(boost.onCountdown > 0){
            boost.onCountdown--;
            document.getElementById("boosterDisplay").innerHTML = "Random Booster " + boost.onMultiplier + "x <span class='text-success'>ON</span> (" + boost.onCountdown + "s):";
        }else{
            boost.onCountdown = boost.onCountdownStart;
            boost.onMultiplier = 1;
            boost.boostOn = false;
        }
    }
}, 1000);

// saat klik
function clicked(){
    gainMoney();
    refreshMoneyDisplay();
    clickAnimation();
}

// rumus income uang
function gainMoney(){
    moneyNoPercentage = stats.moneyup * stats.multiplier * boost.onMultiplier * stats.up1 * stats.up2 * stats.up3;  // rumus dasar
    stats.money += Math.round((moneyNoPercentage + ((moneyNoPercentage) * (stats.prestige/100))) * 100)/100; // rumus dengan prestige
}

// refresh display uang
function refreshMoneyDisplay(){
    document.getElementById("moneyDisplay").innerHTML = "Money: " +  Math.round(stats.money * 100)/100;
}

// animasi klik, digunakan pada klik dan autoclicker
function clickAnimation(){
    moneyNoPercentage = stats.moneyup * stats.multiplier * boost.onMultiplier * stats.up1 * stats.up2 * stats.up3;

    var moneyAnimation = document.createElement("p");
    moneyAnimation.setAttribute("style", "color: black");
    moneyAnimation.innerHTML = "+" + (Math.round((moneyNoPercentage + ((moneyNoPercentage) * (stats.prestige/100))) * 100)/100);
    document.getElementById("moneyAnimation").appendChild(moneyAnimation);
    moneyAnimation.classList.add("moneyAnimation");

    // remove animasi yg sudah fade ketika > 25 child
    if(document.getElementById("moneyAnimation").childNodes.length > 25){
        document.getElementById("moneyAnimation").removeChild(document.getElementById("moneyAnimation").firstElementChild);
    }
}

// Saat booster di claim
function claimBoost(){
    document.getElementById("boosterButton").setAttribute("class", "btn btn-warning btn-sm ms-2 disabled");
    boost.boostOn = true;
    // Rumus: Math.floor(Math.random() * (max - min + 1) ) + min;
    boost.onMultiplier = Math.floor(Math.random() * (boost.maxMul - boost.minMul + 1)) + boost.minMul;
    boost.boostCountDownStart += boost.boostIncr;
    boost.boostCountDown = boost.boostCountDownStart;
}

// autoclicker
var iClicker = 0;
function autoClicker(){
    setTimeout(function(){
        if(stats.autoclicker > 30){
            if(iClicker % 4 == 0){
                clickAnimation();
            }
        }else{
            clickAnimation();
        }
        gainMoney();
        iClicker++;
        if(iClicker < stats.autoclicker){
            autoClicker();
        }else{
            iClicker = 0;
            refreshMoneyDisplay();
        }
    }, 100); // kecepatan animasi
}

// saat coba beli autoclicker
function buyAutoClicker(level){
    if(stats.money < autoClickCost[level]){
        alert("Uang anda tidak cukup! :(");
    }else{
        stats.money -= autoClickCost[level];
        stats.autoclicker += autoClickValue[level];
        autoClickCost[level] += autoClickIncr[level];
        redrawButtons();
        switch(level){
            case 0: $("#displayPekerja").append('<img src="assets/pkj3.png" class="p-1" style="height: 3em;">'); break;
            case 1: $("#displayPekerja").append('<img src="assets/pkj2.png" class="p-1" style="height: 3em;">'); break;
            case 2: $("#displayPekerja").append('<img src="assets/pkj1.png" class="p-1" style="height: 3em;">'); break;
        }
    }
}

// saat coba beli multiplier
function buyMultiplier(level){
    if(stats.money < mulCost[level]){
        alert("Uang anda tidak cukup! :(");
    }else{
        stats.money -= mulCost[level];
        if(stats.multiplier == 1){
            stats.multiplier += mulValue[level] - 1;
        }else{
            stats.multiplier += mulValue[level];
        }
        mulCost[level] += mulIncr[level];
        redrawButtons();

        randItem = Math.floor(Math.random() * (12 - 1 + 1) + 1);
        switch(randItem){
            case 1: $("#displayItems").append('<img src="assets/FastFood/Burgar.png" class="p-1" style="height: 3em;">'); break;
            case 2: $("#displayItems").append('<img src="assets/FastFood/Burrito.png" class="p-1" style="height: 3em;">'); break;
            case 3: $("#displayItems").append('<img src="assets/FastFood/Chips.png" class="p-1" style="height: 3em;">'); break;
            case 4: $("#displayItems").append('<img src="assets/FastFood/Cola.png" class="p-1" style="height: 3em;">'); break;
            case 5: $("#displayItems").append('<img src="assets/FastFood/Energy drink.png" class="p-1" style="height: 3em;">'); break;
            case 6: $("#displayItems").append('<img src="assets/FastFood/French fries.png" class="p-1" style="height: 3em;">'); break;
            case 7: $("#displayItems").append('<img src="assets/FastFood/Hot-dog.png" class="p-1" style="height: 3em;">'); break;
            case 8: $("#displayItems").append('<img src="assets/FastFood/Long nuggets.png" class="p-1" style="height: 3em;">'); break;
            case 9: $("#displayItems").append('<img src="assets/FastFood/Nuggets.png" class="p-1" style="height: 3em;">'); break;
            case 10: $("#displayItems").append('<img src="assets/FastFood/Onion rings.png" class="p-1" style="height: 3em;">'); break;
            case 11: $("#displayItems").append('<img src="assets/FastFood/Pizza 1.png" class="p-1" style="height: 3em;">'); break;
            case 12: $("#displayItems").append('<img src="assets/FastFood/Pizza 2.png" class="p-1" style="height: 3em;">'); break;
        }
    }
}

// beli prestige
function buyPrestige(){
    if(prestige.unlocked){
        if(stats.money >= prestige.prestigeCost){
            if(confirm("Jika anda menekan OK, semua progress akan direset. Tapi akan dapat +" + prestige.prestigeIncr + "% pendapatan permanen.")){
                // reset semua stats
                stats.money = 0;
                stats.autoclicker = 0;
                stats.upgrade = 0;
                stats.moneyup = 1;
                stats.multiplier = 1;
                autoClickCost = autoClickCostStart;
                mulCost = mulCostStart;
                // reset UI game
                redrawButtons();
    
                // berikan reward prestige, dan increment harga prestige
                prestige.prestigeCost += prestige.prestigeCostIncr;
                stats.prestige += prestige.prestigeIncr;

                prestige.unlocked = false;

                $("#displayLokasi").text("Lokasi: Desa");
            }
        }
    }else{
        alert('Beli Upgrade level 3 dahulu!');
    }
}

// Render ulang button
function redrawButtons(){
    for(i = 0; i < 4; i++){
        if(stats.upgrade >= i){
            if(stats.upgrade > i){
                $("#displayLokasi").text("Lokasi: " + upgradeName[i]);
            }
            $("#menuUpgrade" + (i + 1) + "Locked").hide();
            $("#menuUpgrade" + (i + 1)).show();
            $("#menuUpgrade" + (i) + "Locked").show();
            $("#menuUpgrade" + (i) + "Locked").children().text("SOLD OUT");
            $("#menuUpgrade" + (i)).hide();
        }
    }

    document.getElementById("boosterDisplay").innerHTML = "Random Booster (" + boost.boostCountDown + "s):";
    document.getElementById("displayAutoClickerCount").innerHTML = "Auto Clicker (" + stats.autoclicker + " cps)";
    document.getElementById("displayMultiplierCount").innerHTML = "Multiplier (" + stats.multiplier + "x)";
    document.getElementById("prestigeDisplay").innerHTML = "Prestige (+" + stats.prestige + "%): ";
    
    for(i = 0; i < 3; i++){
        document.getElementById("menuUpgrade" + (i + 1)).childNodes[1].innerHTML = "Beli " + upgradeName[i] + " (Cost: " + upgradeCost[i] + ")";
        document.getElementById("menuMultiplier" + (i + 1)).childNodes[1].innerHTML = "Multiplier " + mulValue[i] + "x (Cost: " + mulCost[i] + ")";
        document.getElementById("menuAutoClicker" + (i + 1)).childNodes[1].innerHTML = "Pekerja L" + (i + 1) + " [+" + autoClickValue[i] +" cps] (Cost: " + autoClickCost[i] + ")";
    }
}

// Set warna jika item bisa dibeli
function checkIfLockedUnlocked(){
    up1 = document.getElementById("menuUpgrade1").childNodes[3];
    up2 = document.getElementById("menuUpgrade2").childNodes[3];
    up3 = document.getElementById("menuUpgrade3").childNodes[3];
    mul1 = document.getElementById("menuMultiplier1").childNodes[3];
    mul2 = document.getElementById("menuMultiplier2").childNodes[3];
    mul3 = document.getElementById("menuMultiplier3").childNodes[3];
    auto1 = document.getElementById("menuAutoClicker1").childNodes[3];
    auto2 = document.getElementById("menuAutoClicker2").childNodes[3];
    auto3 = document.getElementById("menuAutoClicker3").childNodes[3];

    if(stats.money >= mulCost[0]){
        mul1.setAttribute("class", "btn btn-success col-2");
    }else if(stats.money < mulCost[0]){
        mul1.setAttribute("class", "btn btn-secondary col-2");
    }
    if(stats.money >= mulCost[1]){
        mul2.setAttribute("class", "btn btn-success col-2");
    }else if(stats.money < mulCost[1]){
        mul2.setAttribute("class", "btn btn-secondary col-2");
    }
    if(stats.money >= mulCost[2]){
        mul3.setAttribute("class", "btn btn-success col-2");
    }else if(stats.money < mulCost[2]){
        mul3.setAttribute("class", "btn btn-secondary col-2");
    }
    if(stats.money >= autoClickCost[0]){
        auto1.setAttribute("class", "btn btn-success col-2");
    }else if(stats.money < autoClickCost[0]){
        auto1.setAttribute("class", "btn btn-secondary col-2");
    }
    if(stats.money >= autoClickCost[1]){
        auto2.setAttribute("class", "btn btn-success col-2");
    }else if(stats.money < autoClickCost[1]){
        auto2.setAttribute("class", "btn btn-secondary col-2");
    }
    if(stats.money >= autoClickCost[2]){
        auto3.setAttribute("class", "btn btn-success col-2");
    }else if(stats.money < autoClickCost[2]){
        auto3.setAttribute("class", "btn btn-secondary col-2");
    }
    if(stats.money >= upgradeCost[0]){
        up1.setAttribute("class", "btn btn-success col-2");
    }else if(stats.money < upgradeCost[0]){
        up1.setAttribute("class", "btn btn-secondary col-2");
    }
    if(stats.money >= upgradeCost[1]){
        up2.setAttribute("class", "btn btn-success col-2");
    }else if(stats.money < upgradeCost[1]){
        up2.setAttribute("class", "btn btn-secondary col-2");
    }
    if(stats.money >= upgradeCost[2]){
        up3.setAttribute("class", "btn btn-success col-2");
    }else if(stats.money < upgradeCost[2]){
        up3.setAttribute("class", "btn btn-secondary col-2");
    }
}

// Saat reset progress permanen
function resetProgress(){
    if(confirm("Jika anda menekan OK, semua progress akan direset permanen.")){
        document.cookie = "gamedata= [0, 1, 0, 1, 0, 0, false, 30, 10, 1, 100000]; SameSite=Lax;";

        posStart = document.cookie.search(/gamedata=/i) + 9;
        posEnd = document.cookie.indexOf("]", posStart) + 1;
        gameDataStr = document.cookie.substring(posStart, posEnd);

        var gameDataArr = JSON.parse(gameDataStr);

        stats.money = gameDataArr[0];
        stats.moneyup = gameDataArr[1];
        stats.autoclicker = gameDataArr[2];
        stats.multiplier = gameDataArr[3];
        stats.upgrade = gameDataArr[4];
        stats.prestige = gameDataArr[5];

        boost.boostOn = gameDataArr[6];
        boost.boostCountDown = gameDataArr[7];
        boost.onCountdown = gameDataArr[8];
        boost.onMultiplier = gameDataArr[9];

        prestige.unlocked = false;
        prestige.prestigeCost = gameDataArr[10];


        stats.up1 = 1;
        stats.up2 = 1;
        stats.up3 = 1;

        checkBackgroundLevel();
        redrawButtons();

        $("#displayLokasi").text("Lokasi: Desa");
    }
}

function buyUpgrade(level){
    if(stats.money < upgradeCost[level]){
        alert("Uang anda tidak cukup! :(");
    }else{
        stats.money -= upgradeCost[level];
        stats.upgrade += 1;
        redrawButtons();

        if(stats.upgrade > 0) stats.up1 = upgradeMul[0];
        if(stats.upgrade > 1) stats.up2 = upgradeMul[1];
        if(stats.upgrade > 2) stats.up3 = upgradeMul[2];

        checkBackgroundLevel();
    }
}

function checkBackgroundLevel(){
    switch(stats.upgrade){
        case 0: 
            $("#bgSecondary1").attr("style", "background-image: url('assets/bg/lvl0.avif'); background-size: cover;");
            $("#bgSecondary2").attr("style", "background-image: url('assets/bg/lvl0.avif'); background-size: cover;");
            break;
        case 1:
            $("#bgSecondary1").attr("style", "background-image: url('assets/bg/lvl1.avif'); background-size: cover;");
            $("#bgSecondary2").attr("style", "background-image: url('assets/bg/lvl1.avif'); background-size: cover;");
            break;
        case 2:
            $("#bgSecondary1").attr("style", "background-image: url('assets/bg/lvl2.avif'); background-size: cover;");
            $("#bgSecondary2").attr("style", "background-image: url('assets/bg/lvl2.avif'); background-size: cover;");
            break;
        case 3:
            $("#bgSecondary1").attr("style", "background-image: url('assets/bg/lvl3.avif'); background-size: cover;");
            $("#bgSecondary2").attr("style", "background-image: url('assets/bg/lvl3.avif'); background-size: cover;");
            break;
    }
}