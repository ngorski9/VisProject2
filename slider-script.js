class Slider{
    constructor(){
        this.t1 = -1.0
        this.t2 = -1.0
        this.t3 = -1.0
        this.active = false;
    }
}

let sliders = []
let scale = -1;

// coefficients for the respective sliders.
const coeffs = [
    [1,0,0],
    [0,1,0],
    [0,0,1]
]

const selectors = [
    [0,1,2],
    [3,4,5],
    [6,7,8]
]

var selectors_old = [
    [0,1,2],
    [3,4,5],
    [6,7,8]
]

var animationCounter = 0;
const animation_length = 70;

box_lines = [
  ["eut. frac.",31],
  ["eut. T",32],
  ["T(liqu)",47],
  ["T(sol)",48],
  ["CSC",53],
  ["YS",54],
  ["hardness",55],
  ["CTEvol",56],
  ["Density",57],
  ["Volume",58],
  ["El.conductivity",59],
  ["El. resistivity",60],
  ["heat capacity",61],
  ["Therm. conductivity",62],
  ["Therm. diffusivity",63],
  ["Therm. resistivity",64],
  ["Lin. therm. expnsn.",65],
  ["Tech. therm. expnsn.",66],
]
next_box_line = 0

function displayPercent(num){
    return (num*100).toFixed(1).toString() + "%"
}

function scale_px(num, scale){
    return (num*scale).toString() + "px";
}

function setGlobalScale(scale_){
    scale = scale_;
    x1 = 18*scale;
    y1 = 900*scale;

    x2 = 508*scale;
    y2 = 25*scale;

    x3 = 998*scale;
    y3 = 900*scale;

    document.styleSheets[0].insertRule(".select1{ top: calc(" + y1.toString() + "px); left: calc(" + x1.toString() + "px - 4em); }");
    document.styleSheets[0].insertRule(".select2{ top: calc(" + y2.toString() + "px - 1.7rem); left: calc(" + x2.toString() + "px - 4em); }");
    document.styleSheets[0].insertRule(".select3{ top: calc(" + y3.toString() + "px); left: calc(" + x3.toString() + "px - 4em); }");

    document.styleSheets[0].insertRule(".display1{ top: calc(" + (y1-100*scale).toString() + "px); left: calc(" + (x1-70).toString() + "px); }");
    document.styleSheets[0].insertRule(".display2{ top: calc(" + (y2).toString() + "px); left: calc(" + (x2+15).toString() + "px); }");
    document.styleSheets[0].insertRule(".display3{ top: calc(" + (y3-100*scale).toString() + "px); left: calc(" + (x3+10).toString() + "px); }");
}

function registerSlider(id_){
    const tri = document.getElementById("triangle" + id_.toString());
    const triBox = tri.getBoundingClientRect();
    const slider = tri.children[0];
    const display1 = tri.querySelector(".display1")
    const display2 = tri.querySelector(".display2")
    const display3 = tri.querySelector(".display3")

    dropdowns = tri.getElementsByTagName("select")
    for(let i = 0; i < dropdowns.length; ++i){
        for(let j = 0; j < box_lines.length; ++j){
            const newOption = document.createElement("option")
            newOption.textContent = (box_lines[j])[0]
            newOption.value = (box_lines[j])[1]
            dropdowns[i].appendChild(newOption)
        }
        dropdowns[i].value = box_lines[next_box_line][1]
        selectors[id_][i] = box_lines[next_box_line][1]
        next_box_line += 1

        for(let i = 0; i < 3; i++){
            for(let j = 0; j < 3; j++){
                selectors_old[i][j] = selectors[i][j]
            }
        }
    }

    const dropdown1 = tri.getElementsByClassName("select1")[0]
    dropdown1.addEventListener("change",function(){
        selectors[id_][0] = parseInt(dropdown1.value);
        animationCounter = animation_length
    })

    const dropdown2 = tri.getElementsByClassName("select2")[0]
    dropdown2.addEventListener("change",function(){
        selectors[id_][1] = parseInt(dropdown2.value);
        animationCounter = animation_length
    })

    const dropdown3 = tri.getElementsByClassName("select3")[0]
    dropdown3.addEventListener("change",function(){
        selectors[id_][2] = parseInt(dropdown3.value);
        animationCounter = animation_length
    })

    tri.style.width = scale_px(1016,scale);
    tri.style.height = scale_px(896,scale);
    slider.style.width = scale_px(100,scale);
    slider.style.height = scale_px(100,scale);

    if(id_ == 0){
        var x0 = 18;
        var y0 = 884;
        var t1 = 1.0
        var t2 = 0.0
        var t3 = 0.0
    } else if(id_ == 1){
        var x0 = 508;
        var y0 = 25;
        var t1 = 0.0
        var t2 = 1.0
        var t3 = 0.0
    } else {
        var x0 = 998;
        var y0 = 884;
        var t1 = 0.0
        var t2 = 0.0
        var t3 = 1.0
    }

    slider.style.left = scale_px(x0-50,scale);
    slider.style.top = scale_px(y0-50,scale);
    
    sliders.push(new Slider());

    slider.addEventListener("mousedown", function(){
        if(animationCounter == 0){
            sliders[id_].active = true;
        }
    });

    document.addEventListener("mouseup", function(){
        sliders[id_].active = false;
    });

    document.addEventListener("mousemove", function(event){
        triX = triBox.x;
        triY = triBox.y;
        if(sliders[id_].active){
            x = event.clientX - triX;
            y = event.clientY - triY;

            // hard coded matrix inverse values
            t1 = (-1.02040816e-03)*(x/scale) + (5.82072177e-04)*(y/scale) + 5.03815543e-01
            t2 = (2.18767059e-19)*(x/scale) + (-1.16414435e-03)*(y/scale) + 1.02910361e+00
            t3 = (1.02040816e-03)*(x/scale) + (5.82072177e-04)*(y/scale) + -5.32919151e-01

            clamp = true;
            if( t1 <= 0 ){
                if(t2 <= 0){
                    t1 = 0.0
                    t2 = 0.0
                    t3 = 1.0
                } else if(t3 <= 0) {
                    t1 = 0.0
                    t2 = 1.0
                    t3 = 0.0
                } else {
                    sum = t2 + t3;
                    t1 = 0.0
                    t2 = t2 / sum
                    t3 = t3 / sum
                }
            } else if( t2 <= 0 ){
                if(t3 <= 0){
                    t1 = 1.0
                    t2 = 0.0
                    t3 = 0.0
                } else {
                    sum = t1 + t3;
                    t2 = 0.0
                    t1 = t1 / sum;
                    t3 = t3 / sum;
                }
            } else if( t3 <= 0 ){
                sum = t1 + t2;
                t3 = 0.0
                t1 = t1 / sum;
                t2 = t2 / sum;
            } else{
                clamp = false;
            }

            if(clamp){
                x = scale * (t1 * 18 + t2 * 508 + t3 * 998)
                y = scale * (t1 * 884 + t2 * 25 + t3 * 884)
            }

            coeffs[id_] = [t1,t2,t3]

            slider.style.top = (y-50*scale).toString() + "px";
            slider.style.left  = (x-50*scale).toString() + "px";

            display1.textContent = displayPercent(t1)
            display2.textContent = displayPercent(t2)
            display3.textContent = displayPercent(t3)
        }
    })
}

setGlobalScale(0.2);
registerSlider(0);
registerSlider(1);
registerSlider(2);