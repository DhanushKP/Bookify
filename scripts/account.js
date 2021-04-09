const passengerList = document.querySelector('#passenger-list');
const form = document.querySelector('#add-passenger-form');

//render data
function renderPassenger(doc){
    let g = document.createElement('div');
    g.setAttribute('id', 'pass');
    let name = document.createElement('h1');
    let dob = document.createElement('span');
    let gender = document.createElement('span');
    let number = document.createElement('span');
    let cross = document.createElement('div');

    g.setAttribute('data-id', doc.id);
    name.textContent = doc.data().name;
    dob.textContent = doc.data().dob;
    gender.textContent = doc.data().gender;
    number.textContent = doc.data().number;
    cross.textContent = 'x';

    g.appendChild(name);
    g.appendChild(dob);
    g.appendChild(gender);
    g.appendChild(number);
    g.appendChild(cross);

    passengerList.appendChild(g);

    //deleting data
    cross.addEventListener('click', (e) => {
        e.stopPropagation();
        let id = e.target.parentElement.getAttribute('data-id');
        db.collection('Passengers').doc(id).delete();
    })
}

//getting data
//db.collection('Passengers').get().then((snapshot) => {
    //snapshot.docs.forEach(doc => {
        //renderPassenger(doc);
    //})
//})

//saving data
form.addEventListener('submit', (e) => {
    e.preventDefault();
    db.collection('Passengers').add({
        name: form.name.value,
        dob: form.dob.value,
        gender: form.gender.value,
        number: form.number.value
    });
    form.name.value = '';
    form.dob.value = '';
    form.gender.value = '';
    form.number.value = '';
})

//real time listener
db.collection('Passengers').onSnapshot(snapshot => {
    let changes = snapshot.docChanges();
    changes.forEach(change => {
        if(change.type == 'added'){
            renderPassenger(change.doc);
        } else if (change.type = 'removed'){
            let li = passengerList.querySelector('[data-id=' + change.doc.id + ']');
            passengerList.removeChild(li);
        }
    })
})
