class MonoParentModel{
    constructor(){
        super(true, MonoParentModel.uiBuildFuntion);
    }

    static uiBuildFuntion(){
        let monoParentModelUI = document.getElementById("monoParentalModelUI");
        let uiClone = monoParentModelUI.cloneNode(true);
        return uiClone;
    }
}