class Slider{
    constructor(){
        this.t1 = -1.0
        this.t2 = -1.0
        this.t3 = -1.0
        this.active = false;
    }
}

sliders = []
scale = -1;

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
}

function registerSlider(id_){
    const tri = document.getElementById("triangle" + id_.toString());
    const triBox = tri.getBoundingClientRect();
    const slider = tri.children[0];

    tri.style.width = scale_px(1016,scale);
    tri.style.height = scale_px(896,scale);
    slider.style.width = scale_px(100,scale);
    slider.style.height = scale_px(100,scale);
    slider.style.left = scale_px(500,scale);
    slider.style.top = scale_px(500,scale);
    
    sliders.push(new Slider());

    slider.addEventListener("mousedown", function(){
        sliders[id_].active = true;
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

            console.log(t1.toString() + " " + t2.toString() + " " + t3.toString());
            console.log(x.toString() + " "  + y.toString())

            slider.style.top = (y-50*scale).toString() + "px";
            slider.style.left  = (x-50*scale).toString() + "px";

            // temp. Remove later:
            document.getElementById("coords").innerHTML = "(" + t1.toFixed(2).toString() + "," + t2.toFixed(2).toString() + "," + t3.toFixed(2).toString() + ")";
        }
    })
}

setGlobalScale(0.2);
registerSlider(0);
registerSlider(1);
registerSlider(2);