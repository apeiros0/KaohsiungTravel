(function () {
    // 撈回來的資料
    let data = [];
    let displayData = [];

    const kDistrictSelect = document.querySelector('#kDistrictSelect');
    const districtName = document.querySelector('.districtName');
    const districtContent = document.querySelector('.districtContent');
    const hotDistrictList = document.querySelector('.hotDistrictList');
    const hotDistrictListLink = document.querySelector('.hotDistrictListLink');
    const pagination = document.querySelector('.pagination');
    const btnGoTop = document.querySelector('.goTop');



    // 當前頁
    let pageNum = 1;
    // 每一個分頁顯示的數量 -> 4 筆
    let contentNum = 4;
    // 頁碼數量
    let pageLeng = 0;
    // 限制的頁數
    // let limitPage = 5;

    // -------------------------------------------------------------
    // ajax 載入資料
    let xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://data.kcg.gov.tw/api/action/datastore_search?resource_id=92290ee5-6e61-456f-80c0-249eae2fcc97', true);
    xhr.send(null);

    xhr.onload = function () {
        let array = JSON.parse(xhr.responseText);

        for (let i = 0; i < array.result.records.length; i++) {
            // push 每筆 records 到 data
            data.push(array.result.records[i])
        }

        let district = [];

        // 把 data 裡的地區塞到 district 裡
        for (let i = 0; i < data.length; i++) {
            district.push(data[i].Zone);
        }

        // 排除陣列的重複元素
        // filter 過濾符合條件的元素，若不符合則刪除 (不更改原陣列，而回傳新陣列)
        let result = district.filter(function (element, index, array) {
            // arr.indexOf(element) 找出陣列的位置 (重複的以同樣的 index 取代)
            // 陣列的 index (0....arr.length)
            // 找出與 index 相同的目錄，不同的則排除
            return array.indexOf(element) === index;
        });


        // 載入行政區資料到 <select> 裡
        let str = ``;
        const firstSelected = `<option disabled selected>- - 請選擇行政區- -</option>`;
        for (let i = 0; i < result.length; i++) {
            str += `<option value="${result[i]}">${result[i]}</option>`;
            // createElement
            // var option = document.createElement('option');
            // option.textContent = result[i];
            // kDistrictSelect.appendChild(option);
        }
        kDistrictSelect.innerHTML = firstSelected + str;

        // 顯示熱門行政區
        hotDistrict(result);

        // 載入預設的行政區內容
        getAllDistrict();
    }

    // 監聽
    kDistrictSelect.addEventListener('change', changeDistrict, false);
    hotDistrictList.addEventListener('click', changeLink, false);
    pagination.addEventListener('click', switchPages, false);
    btnGoTop.addEventListener('click', goTop, false);


    // -------------------------------------------------------------
    // 顯示全部行政區
    function getAllDistrict() {
        districtName.textContent = '高雄旅遊地';
        displayData = data;
        displayDistrict();
    }

    // 切換行政區改變當前標題、顯示頁數
    function changeDistrict(e) {
        e.preventDefault();
        districtName.textContent = e.target.value;

        let distData = [];

        // 從 data 取相同地區的值，存到 distData 裡
        for (let i = 0; i < data.length; i++) {
            if (e.target.value == data[i].Zone || e.target.textContent == data[i].Zone) {
                distData.push(data[i]);
            }
        }

        displayData = distData;

        // 回到第一頁
        pageNum = 1;

        // 取出值後，呼叫 displayDistrict 顯示
        displayDistrict();
    }

    // 更新各區景點
    function displayDistrict() {
        let str = ``;

        // 選取開始的陣列位置 -> 頁碼 乘以 每頁顯示數量
        let start = pageNum * contentNum;
        // 資料總長度
        let dataLen = displayData.length;

        // 計算、顯示有多少頁碼
        calPagesNum(dataLen);


        // 如果 資料長度大於 start，以 start 作為 for 的停止條件
        if (dataLen > start) {
            dataLen = start;
        } else {
            dataLen = displayData.length;
        }

        // 以 start - 每頁顯示數量 作為起始值，再依據條件顯示相應的資料 (0-4、4-8、8-12 ... 筆資料)
        for (let i = start - contentNum; i < dataLen; i++) {
            // 顯示筆數
            str +=
                `<div class="districtCard">
                <div class="cardHeader bgCover" style="background-image: url('${ displayData[i].Picture1}');">
                    <h2>${ displayData[i].Name}</h2>
                    <p>${ displayData[i].Zone}</p>                     
                </div>

                <div class="cardBody">
                    <div class="districtInfo">
                        <div class="infoImg"><img src="images/icons_clock.png" alt="icons_clock"></div>
                        <p>${ displayData[i].Opentime}</p>
                    </div>
                    <div class="districtInfo">
                    <div class="infoImg"><img src="images/icons_pin.png" alt="icons_pin"></div>
                    <p>${ displayData[i].Add}</p>
                    </div>
                
                    <div class="positionSet">
                        <div class="districtInfo">
                            <div class="infoImg"><img src="images/icons_phone.png" alt="icons_phone"></div>
                            <p>${ displayData[i].Tel}</p>  
                        </div>
                        <div class="districtInfo">
                            <div class="infoImg"><img src="images/icons_tag.png" alt="icons_tag"></div>
                            <p>${ displayData[i].Ticketinfo}</p>
                        </div>
                    </div>
                </div>
            </div>`;
        }

        districtContent.innerHTML = str;
    }

    // -------------------------------------------------------------
    // 計算、顯示頁碼
    function calPagesNum(counter) {
        if (counter > contentNum) {
            // Math.ceil() 最小整數：取大於這個數的最小整數
            pageLeng = Math.ceil(counter / contentNum);

            const prev = `<li class="pagePrev"><a href="#">Prev</a></li>`;
            const next = `<li class="pageNext"><a href="#">Next</a></li>`;
            let str = ``;

            // if (pageLeng > limitPage) {
            //     pageLeng = limitPage;
            // } 

            // 加進頁碼
            for (let i = 1; i <= pageLeng; i++) {
                // 顯示當下的頁碼
                if (i == pageNum) {
                    str += `<li class="pageItem"><a class="pageLink active" href="#">${i}</a></li>`;
                } else {
                    str += `<li class="pageItem"><a class="pageLink" href="#">${i}</a></li>`;
                }
            }

            pagination.innerHTML = prev + str + next;

        } else {
            str = `<li class="pageItem"><a class="pageLink active" href="#">1</a></li>`;
            pagination.innerHTML = str;
        }

    }

    // 切換頁面
    function switchPages(e) {
        e.preventDefault();
        if (e.target.nodeName !== 'A') { return }

        // 切換頁碼
        if (e.target.textContent == 'Next') {
            if (pageNum == pageLeng) {
                pageNum = pageLeng;
            } else {
                pageNum++;
            }
        }
        else if (e.target.textContent == 'Prev') {
            if (pageNum == 1) {
                pageNum = 1;
            } else {
                pageNum--;
            }
        }
        else {
            pageNum = parseInt(e.target.textContent);
        }

        // 更新資料
        displayDistrict();
    }

    // 上一頁


    // -------------------------------------------------------------
    // 回到頂端
    window.onscroll = function () { scrollFunction() }
    // 偵測 scroll 的位置，超過 1000 顯示圖片
    function scrollFunction() {
        if (document.documentElement.scrollTop > 800) {
            btnGoTop.style.display = "block";
        } else {
            btnGoTop.style.display = "none";
        }
    }

    function goTop(e) {
        e.preventDefault();
        document.documentElement.scrollTop = 0;
    }

    // -------------------------------------------------------------
    // 熱門行政區

    // 點擊熱門行政區後，出現內容
    function changeLink(e) {
        e.preventDefault();
        if (e.target.nodeName !== 'A') { return }

        changeDistrict(e);
        districtName.textContent = e.target.textContent;
    }

    // 隨機跑熱門行政區
    function hotDistrict(result) {
        let randomArr = [];
        let max = result.length;
        let min = 0;
        const randomLength = 4;


        // 過濾重複值
        for (let i = 0; i < randomLength; i++) {
            let randomNum = getRandom(min, max);
            randomArr.push(randomNum);

            for (var j = 0; j < i; j++) {
                if (randomArr[i] == randomArr[j]) {
                    randomArr.splice(j, 1);
                    randomArr.push(randomNum - 1);
                }
            }
        }

        // 顯示熱門行政區
        let str = ``;
        let color = ['#8a82cc', '#559AC8', '#F5D005', '#FFA782'];
        for (let i = 0; i < randomArr.length; i++) {
            str += `<li style = "background: ${color[i]}";><a href="#" class="hotDistrictListLink">${result[randomArr[i]]}</a></li>`;
        }

        hotDistrictList.innerHTML = str;
    }
    function getRandom(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }
}());