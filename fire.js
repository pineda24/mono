
var db = firebase.database().ref('//');

var cellSize = 1.0;
        
// Ultima vez que se uso el mouse en el canvas 2D x/y
var lastMouseX = -1;
var lastMouseY = -1;

var draggedTransformNode = null;

// Vectores 3D en el espacio del mundo, en el movimiento x/y en la pantalla
var draggingUpVec    = null;
var draggingRightVec = null;

// Posicion
var unsnappedDragPos = null;
var touchMono = false;

//------------------------------------------------------------------------------------------------------------------

var mouseMoved = function(event)
{
    //offsetX / offsetY polyfill for FF
    // console.log(event);
    var target = event.target || event.srcElement;
    var rect = target.getBoundingClientRect();
    event.offsetX = event.clientX - rect.left;
    event.offsetY = event.clientY - rect.top;

    if (lastMouseX === -1)
    {
        // console.log("A")
        lastMouseX = event.offsetX;
    }
    if (lastMouseY === -1)
    {
        // console.log("B")
        lastMouseY = event.offsetY;
    }
    // Cuando movemos un objeto
    if (draggedTransformNode)
    {
        // console.log("C")
        //Enviamos el desplazamiento actual en X y el anterior como primer parametro y segundo igual como Y
       dragObject(event.offsetX - this.lastMouseX, event.offsetY - this.lastMouseY);
    }
    // console.log("+++++++++++++++++++++");
    // Coordenadas de la pantalla en 2D
    lastMouseX = event.offsetX;
    lastMouseY = event.offsetY;
    
};

//------------------------------------------------------------------------------------------------------------------
// Iniciamos los objetos con la direccion del objeto
var startDragging = function(transformNode,id)
{        
    // Deshabilitar la navegación durante el arrastre
    document.getElementById("navInfo").setAttribute("type", '"NONE"');
    
    // console.log("transformNode: "+transformNode)
    //Guardamos la referencia del objeto
    draggedTransformNode = transformNode;    
    // Obtenemos la coordenadas de la posicion        
    unsnappedDragPos     = new x3dom.fields.SFVec3f.parse(transformNode.getAttribute("translation"));
    
    // Calcular los vectores de arrastre en las coordenadas del mundo
    //(since navigation is disabled, those will not change until dragging has been finished)

    // Obtener el marco local 3D del espectador
    var x3dElem  = document.getElementById("x3dElement");
    var vMatInv  = x3dElem.runtime.viewMatrix().inverse();            
    var viewDir  = vMatInv.multMatrixVec(new x3dom.fields.SFVec3f(0.0, 0.0, -1.0));
    
    // Inicializamos el vector de movimiento del moviento hacia arriba y abajo
    draggingUpVec    = vMatInv.multMatrixVec(new x3dom.fields.SFVec3f(0.0, 1.0,  0.0));;
    // Inicializamos el vector de movimiento del moviento hacia derecha e izquierda
    draggingRightVec = viewDir.cross(this.draggingUpVec);   

    
    // Proyectar una unidad mundial a la pantalla para obtener su tamaño en píxeles           
    var x3dElem  = document.getElementById("x3dElement");
    var p1 = x3dElem.runtime.calcCanvasPos(unsnappedDragPos.x, unsnappedDragPos.y, unsnappedDragPos.z);
    var p2 = x3dElem.runtime.calcCanvasPos(unsnappedDragPos.x + draggingRightVec.x,
                                           unsnappedDragPos.y + draggingRightVec.y,
                                           unsnappedDragPos.z + draggingRightVec.z)
    

    // Calculamos el factor de aumento 
    var magnificationFactor = 1.0 / Math.abs(p1[0] - p2[0]);
    // console.log("magnificationFactor: "+magnificationFactor)
    
    // Escala vector "UP" y vector "RIGHT" en consecuencia, el cual se hace una multiplicacion de vectores
    // de los vectores en posicion arriba o abajo e izquierda o derecha          
    draggingUpVec    = draggingUpVec.multiply(magnificationFactor);
    draggingRightVec = draggingRightVec.multiply(magnificationFactor);
    

};

//------------------------------------------------------------------------------------------------------------------

var dragObject = function(dx, dy)
{
    // Aumentar el vector y el vector derecho en consecuencia
    // Calculamos el vector desplazamiento cuando va hacia arriba o abajo          
    var offsetUp    = draggingUpVec.multiply(-dy);
    // Calculamos el vector desplazamiento cuando va hacia la derecha o izquierda
    var offsetRight = draggingRightVec.multiply(dx);

    // Actualizamos la translacion
    unsnappedDragPos = unsnappedDragPos.add(offsetUp).add(offsetRight);
    draggedTransformNode.setAttribute("translation", unsnappedDragPos.toString());
    touchMono = true;

}

//------------------------------------------------------------------------------------------------------------------
// Reiniciamos las variables globales cuando precionamos con el mouse
var stopDragging = function()
{
    // Detectamios si toco a un personaje y posteriormente vemos a cual de los dos
    if(touchMono){
        if ( draggedTransformNode.id == 'moonKnight'){
            db.update({ 'moonKnight/x': unsnappedDragPos.x});
            db.update({ 'moonKnight/y': unsnappedDragPos.y});
            db.update({ 'moonKnight/z': unsnappedDragPos.z});
        }else{
            db.update({ 'captainMarvel/x': unsnappedDragPos.x});
            db.update({ 'captainMarvel/y': unsnappedDragPos.y});
            db.update({ 'captainMarvel/z': unsnappedDragPos.z});
        }
        draggedTransformNode.setAttribute("translation", unsnappedDragPos.toString());
    }
    
    draggedTransformNode = null;                
    draggingUpVec        = null;
    draggingRightVec     = null;
    unsnappedDragPos     = null;
    touchMono = false;
    
    // Volver a habilitar la navegación después de arrastrar
    document.getElementById("navInfo").setAttribute("type", '"EXAMINE" "ANY"');
};

// Inicializamos los personajes con sus coordenadas
 function initPeron(id) {
    console.log("INITTTT")
    let aux = ''
    firebase.database().ref(id).on('value',(snap)=>{
        // console.log(snap.val()['x']);
        aux +=  snap.val()['x']
        aux += ' '
        aux +=  snap.val()['y']
        aux += ' '
        aux +=  snap.val()['z']
        // console.log(aux)
        document.getElementById(id).setAttribute('translation', aux)
        // return aux;
    });
}

function generateData1(min=1, max=5) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function generateData2(min=5, max=10) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateData3(min=5, max=10) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


