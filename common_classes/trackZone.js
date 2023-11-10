class TrackZone{
    constructor(_name, _color, _start, _end){
        this.name = _name;
        this.color = _color;
        this.startT = _start;//t value on intBorder
        this.endT = _end;//t value on intBorder
        this.startLateral;
        this.endLateral;
    }

    SetStartLateral(_start){
        this.startLateral = _start;
    }

    SetEndLateral(_end){
        this.endLateral = _end;
    }
}

module.exports = {TrackZone};