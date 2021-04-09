const register= document.querySelector('#register-form')
register.addEventListener('submit', (e) => {

    const email = register['reg-email'].value;
    const password = register['reg-password'].value;

    auth.createUserWithEmailAndPassword(email, password).then(cred => {
        console.log(cred);
        register.reset();
    })
})

const loginForm = document.querySelector('#signin-form');
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = loginForm['sign-email'].value;
    const password = loginForm['sign-password'].value;

    auth.signInWithEmailAndPassword(email, password).then(cred => {
        console.log(cred);
        window.location = "base.html";
    })

})