/* Calculation box */
let calculationBoxHeading = document.querySelector('#calculation-box #calculation-box-heading');
calculationBoxHeading.addEventListener('click', () => {
    let calcBoxDetails = document.querySelector('#calculation-box #calculation-box-details');
    if (calcBoxDetails.style.display === 'block') {
        calcBoxDetails.style.display = 'none';
    } else {
        calcBoxDetails.style.display = 'block';
    }
})