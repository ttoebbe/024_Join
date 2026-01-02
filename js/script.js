function init() {
    // loadingscreenOn();
    setTimeout(startAnimation, 200);
    
}

function startAnimation() {
    let homepageImage = document.getElementById('img_animation');
    homepageImage.classList.add('animiert');
    document.getElementById('bg').classList.add('bg-animiert');
    setTimeout(() => {
        document.getElementById('bg').style.display = 'none';
    }, 500);
}

// function loadingscreenOff() {
//     let loadingScreen = document.getElementById('loading-screen');
//     loadingScreen.style.display = 'none';
// }

// function loadingscreenOn() {
//     let loadingScreen = document.getElementById('loading-screen');
//     loadingScreen.style.display = 'flex';
// }
