// Inicializamos las variables de firebase de nuestras colecciones
var moonKnight = firebase.database().ref("moonKnight");
var captainMarvel = firebase.database().ref("captainMarvel");

// Actualizamos la translacion de cada personaje
firebase.database().ref("moonKnight").on('value',(snap)=>{
    // console.log(snap.val()['x']);
    console.log("CHANGEEE")
    let aux = '';
    aux +=  snap.val()['x']
    aux += ' '
    aux +=  snap.val()['y']
    aux += ' '
    aux +=  snap.val()['z']
    // console.log(aux)
    document.getElementById("moonKnight").setAttribute('translation', aux)
    // return aux;
});

captainMarvel.on('value',(snap)=>{
    // console.log(snap.val()['x']);
    let aux = '';
    aux +=  snap.val()['x']
    aux += ' '
    aux +=  snap.val()['y']
    aux += ' '
    aux +=  snap.val()['z']
    // console.log(aux)
    document.getElementById("captainMarvel").setAttribute('translation', aux)
    // return aux;
});