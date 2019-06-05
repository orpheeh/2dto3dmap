
function Batiment() {
    this.mur_ext = [];
    this.mur_int = {
        step: [
            []
        ],
    };

    this.CONTOUR = 0;
    this.INTERIEUR = 1;

    this.currentStep = 0;
    this.drawSector = this.CONTOUR;

    /**
     * Ajoute un point dans la carte du batiment
     */
    this.addPoint = function (point) {
        if (this.drawSector === this.CONTOUR) {
            this.mur_ext.push(point);
        } else {
            const last = this.mur_int.step[currentStep].length - 1;
            if (this.mur_int.step[currentStep][last].length === 2) {
                this.mur_int.step[currentStep].push([point]);
            } else {
                this.mur_int.step[currentStep][last].push(point);
            }
        }
    }

    /**
     * Change l'endroit on enregistre les points
     * 
     * @param {section} Number
     */
    this.setDrawSection = function (section) {
        if (section === this.INTERIEUR) {
            this.drawSector = this.INTERIEUR;
        } else {
            this.drawSector = this.CONTOUR;
        }
    }

    /**
     * Retourne le dernier mur interieur
     */
    this.getLastInnerWalk = function () {
        return mur_int.step[currentStep][mur_int.step[currentStep].length - 1];
    }
}

function Map() {
    this.batiments = [];
    this.selectedBatiment = -1;

    /**
     * Permet de sélectionner le batiment situé à la position @{index}
     * Renvoie true si l'opération a réuissi
     * 
     * @param { index } Number
     * @return Boolean
     */
    this.selectBatiment = function (index) {
        if (index < this.batiments.length) {
            this.selectedBatiment = index;
            return true;
        }
        return false;
    }

    /**
     * Permet de récupérer le batiment selectionné
     * 
     * @return Batiment
     */
    this.getSelectedBatiment = function () {
        if (this.selectedBatiment < 0) return null;
        return this.batiments[this.selectedBatiment];
    }

    /**
     * Ajoute un étage au batiment sélectionné
     * Renvoie le nombre d'étage du batiment après l'ajout
     * 
     * @return number
     */
    this.addStepOnSelectedBatiment = function () {
        if (this.selectedBatiment < 0) return -1;
        if(this.batiments[this.selectedBatiment].mur_int.step.length === 6) 
            return 6;
        this.batiments[this.selectedBatiment].mur_int.step.push([]);
        return this.batiments[this.selectedBatiment].mur_int.step.length;
    }

    /**
     * Supprime le dernier étage du batiment sélectionné
     */
    this.removeLastStepOnSelectedBatiment = function () {
        if (this.selectedBatiment >= 0) {
            if (this.batiments[this.selectedBatiment].mur_int.step.length === 1)
                return 1;
            this.batiments[this.selectedBatiment].mur_int.step.pop();
            return this.batiments[this.selectedBatiment].mur_int.step.length;
        }
        return -1;
    }

    /**
     * Change l'étage de dessin intérieur pour le batiment sélectionné
     * 
     * @param {current} Number
     */
    this.setCurrentStepOfSelectedBatiment = function (current) {
        if (this.selectedBatiment < 0) return;
        const b = this.batiments[this.selectedBatiment];
        if (current < b.mur_int.step.length) {
            b.currentStep = current;
        }
    }
    /**
     * Ajoute un batiment dans la carte
     */
    this.addBatiment = function () {
        this.batiments.push(new Batiment());
        return this.batiments.length;
    }

    /**
     * Retire le batiment situé à la position index de la carte
     * 
     * @param {index} Number
     */
    this.removeBatiment = function (index) {
        this.batiments.splice(index, 1);
        if (this.selectedBatiment === index)
            this.selectedBatiment = -1;
    }
}
