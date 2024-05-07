
(function (){
    let isPause = false;
    let animationId = null;
    let speed = 3;

    let score = 0;

    const car = document.querySelector('.car');
    const carInfo = {
        ...createElementInfo(car),
        move:{
            top: null,
            bottom: null,
            left: null,
            right: null,
        },
    };

    const coin = document.querySelector('.coin');
    const coinInfo = createElementInfo(coin)

    const danger = document.querySelector('.danger');
    const dangerInfo = createElementInfo(danger)

    const arrow = document.querySelector('.arrow');
    const arrowInfo = createElementInfo(arrow)

    const road = document.querySelector('.road')
    const roadHeight = road.clientHeight;
    const roadWidth = road.clientWidth / 2;

    const gameButton = document.querySelector('.game-button');
    const gameScore = document.querySelector('.game-score');
    const backdrop = document.querySelector('.backdrop');
    const restartButton = document.querySelector('.restart-button');

    const trees = document.querySelectorAll('.tree');

    const treesCoords = [];

    for(let i=0; i < trees.length; i++){
        const tree = trees[i];
        const coordsTree = getCoords(tree);

        treesCoords.push(coordsTree)
    }

    document.addEventListener('keydown', (event) => {
        if(isPause){
            return // дальше не идет
        }
        const code = event.code;

        if (code === 'ArrowUp' && carInfo.move.top === null) {
            carInfo.move.top =  requestAnimationFrame(carMoveToTop);
        }

        else if (code === 'ArrowDown' && carInfo.move.bottom === null){
            carInfo.move.bottom =  requestAnimationFrame(carMoveToBottom);
        }

        else if (code === 'ArrowLeft' && carInfo.move.left === null){
            carInfo.move.left =  requestAnimationFrame(carMoveToLeft);
        }

        else if (code === 'ArrowRight' && carInfo.move.right === null){
            carInfo.move.right =  requestAnimationFrame(carMoveToRight);
        }
        
    });

    document.addEventListener('keyup', (event) => {
        const code = event.code;

        if (code === 'ArrowUp'){
            cancelAnimationFrame(carInfo.move.top);
            carInfo.move.top = null;
        }

        else if (code === 'ArrowDown'){
            cancelAnimationFrame(carInfo.move.bottom);
            carInfo.move.bottom = null;
        }

        else if (code === 'ArrowLeft'){
            cancelAnimationFrame(carInfo.move.left);
            carInfo.move.left = null;
        }
        
        else if (code === 'ArrowRight'){
            cancelAnimationFrame(carInfo.move.right);
            carInfo.move.right = null;
        }
    });

    function createElementInfo(element){
        return {
            width: element.clientWidth / 2,
            height: element.clientHeight,
            coords: getCoords(element),
            visible: true,
            ignoreAppearance: false
        }
    }

    function carMoveToTop(){
        const newY = carInfo.coords.y -5;

        if(newY < 0){ // не пропускает вверх
            return;
        }
        carInfo.coords.y = newY;
        carMove(carInfo.coords.x, newY);
        carInfo.move.top =  requestAnimationFrame(carMoveToTop);
    }
    function carMoveToBottom(){
        const newY = carInfo.coords.y +5;
        if((newY + carInfo.height) > roadHeight){ 
            return;
        }
        carInfo.coords.y = newY;
        carMove(carInfo.coords.x, newY)
        carInfo.move.bottom =  requestAnimationFrame(carMoveToBottom);
    }
    function carMoveToLeft(){
        const newX = carInfo.coords.x -5;
        console.log(newX)
        if(newX < -roadWidth + carInfo.width){
            return;
        }

        carInfo.coords.x = newX;
        carMove(newX, carInfo.coords.y)
        carInfo.move.left =  requestAnimationFrame(carMoveToLeft);
    }
    function carMoveToRight(){
        const newX = carInfo.coords.x +5;
        carInfo.coords.x = newX;

        if(newX > roadWidth - carInfo.width){
            return;
        }

        carMove(newX, carInfo.coords.y)
        carInfo.move.right =  requestAnimationFrame(carMoveToRight);
    }

    function carMove(x, y){
        car.style.transform = `translate(${x}px, ${y}px)`;
    }

    animationId =  requestAnimationFrame(starGame);

    function starGame(){ // анимация запускается

        elementAnimation(danger, dangerInfo, -250);
        if(dangerInfo.visible && hasCollision(carInfo, dangerInfo)){;
            return finishGame();
        }

        treesAnimation();

        elementAnimation(coin, coinInfo,  -100);
        if(coinInfo.visible && hasCollision(carInfo, coinInfo)){
            score++; // счет
            gameScore.innerText = score;
            coin.style.display = 'none';
            coinInfo.visible = false; 

        }

        elementAnimation(arrow, arrowInfo, -600);
        if(arrowInfo.visible && hasCollision(carInfo, arrowInfo)){
            arrow.style.display = 'none'; 
            arrowInfo.visible = false;
            danger.style.opacity = 0.2; // сделать обьезды прозрачными
            dangerInfo.visible = false; 

            arrowInfo.ignoreAppearance=true; // игрорировать знаки
            dangerInfo.ignoreAppearance=true;

            speed += 10 ; // увеличить
            
            setTimeout( () => {
                danger.style.opacity = 1; 
                speed -= 10; // возвращать скорость

                setTimeout(()=> {
                    dangerInfo.visible = true; 
                    arrowInfo.ignoreAppearance=false;
                    dangerInfo.ignoreAppearance=false;
                }, 500) 
            }, 3000); 

        }


        animationId =  requestAnimationFrame(starGame);

    }

    function treesAnimation(){
        for(let i=0; i < trees.length; i++){ 
            const tree = trees[i];
            const coords = treesCoords[i];

            let newYCoord = coords.y + speed;

            if(newYCoord > window.innerHeight){
            newYCoord = -224;
            }

            treesCoords[i].y = newYCoord;
            tree.style.transform = `translate(${coords.x}px, ${newYCoord}px)`;
        }
    }

    function elementAnimation(elem, elemInfo, elemInitialYCoord){
        let newYCoord = elemInfo.coords.y + speed;
        let newXCoord = elemInfo.coords.x;

        if(newYCoord > window.innerHeight){ // Если наш элемент уходит за рамки то,
            newYCoord = elemInitialYCoord; // перемещаем вверх на его же размер

            const direction = parseInt(Math.random() * 2);
            const maxXCoord = (roadWidth + 1 - elemInfo.width);
            const randomXCoord = parseInt(Math.random() * maxXCoord);

            if(!elemInfo.ignoreAppearance){
                elem.style.display = 'initial';
                elemInfo.visible = true; 
            }

            if(direction === 0){// двигаем влево
                newXCoord = -randomXCoord
            }
            else if(direction === 1){ // двигаем вправо
                newXCoord = randomXCoord
            }


        }


        elemInfo.coords.y = newYCoord
        elemInfo.coords.x = newXCoord
        elem.style.transform = `translate(${newXCoord}px, ${newYCoord}px)`;
    }

    function getCoords(element){
        const matrix = window.getComputedStyle(element).transform;
        const array = matrix.split(',');
        const y = array[array.length -1];
        const x = array[array.length -2];
        const numericY = parseFloat(y);
        const numericX = parseFloat(x)
        return {x: numericX, y: numericY};
    }

    function hasCollision(elem1Info, elem2Info){
        const carYTop = elem1Info.coords.y; // взять верхнюю часть машины
        const carYBottom = elem1Info.coords.y + elem1Info.height; // взять нижнию часть машины +  высоту

        const carXLeft = elem1Info.coords.x - elem1Info.width ;
        const carXRight = elem1Info.coords.x + elem1Info.width; 

        const coinYTop = elem2Info.coords.y;
        const coinYBottom = elem2Info.coords.y + elem2Info.height;

        const coinXLeft = elem2Info.coords.x - elem2Info.width;
        const coinXRight = elem2Info.coords.x + elem2Info.width;
        
        //y
        if(carYTop > coinYBottom || carYBottom < coinYTop) {  
            return false;
        }

        //x
        if(carXRight < coinXLeft || carXLeft > coinXRight){
            return false;
        }

        return true;
    }

    function cancelAnimations(){
        cancelAnimationFrame(animationId);
        cancelAnimationFrame(carInfo.move.top); 
        cancelAnimationFrame(carInfo.move.bottom);
        cancelAnimationFrame(carInfo.move.left);
        cancelAnimationFrame(carInfo.move.right);

        cancelAnimationFrame(animationId)
        cancelAnimationFrame(carInfo.move.top);
        cancelAnimationFrame(carInfo.move.bottom);
        cancelAnimationFrame(carInfo.move.left);
        cancelAnimationFrame(carInfo.move.right);
    }

    function finishGame(){
        cancelAnimations();
        gameScore.style.display= 'none'; // при завершении исчезает стоп и счет
        gameButton.style.display= 'none';
        backdrop.style.display = 'flex';
        const scoreText = backdrop.querySelector('.finish-score');
        scoreText.innerText = score
    }

    gameButton.addEventListener('click', () =>{
        isPause = !isPause;
        if(isPause){
            cancelAnimations()
            gameButton.children[0].style.display = 'none';
            gameButton.children[1].style.display = 'initial';
        }else{
            animationId =  requestAnimationFrame(starGame);
            gameButton.children[0].style.display = 'initial';
            gameButton.children[1].style.display = 'none';
        }
    })

    restartButton.addEventListener('click',() =>{
        window.location.reload(); // обнавление
    })
})();