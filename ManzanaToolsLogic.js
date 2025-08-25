var activeLayer;
var manzanaID;
var filterExpression;
var selectedCount;
var editDialog;
var fieldSelector;
var valueInput;

function init(dialogRef, comboRef, textRef) {
    editDialog = dialogRef;
    fieldSelector = comboRef;
    valueInput = textRef;
}

function activateTool() {
    activeLayer = Qgis.activeLayer();
    if (!activeLayer) {
        Qgis.message("No hay una capa activa.", "error");
        return;
    }
    if (activeLayer.name !== "Estructuras Nuevas") {
        Qgis.message("La capa activa no es 'Estructuras Nuevas'.", "error");
        return;
    }

    Qgis.setMapTool("identify");
    Qgis.message("Toque una estructura para seleccionar la manzana.", "info");

    Qgis.mapClicked.connect(onMapClick);
}

function onMapClick(identifyResult) {
    if (!identifyResult || identifyResult.length === 0) {
        Qgis.message("No se encontró ningún objeto.", "warning");
        return;
    }

    var feature = identifyResult[0].feature;
    manzanaID = feature.attribute("Manzana");

    if (!manzanaID) {
        Qgis.message("El objeto no tiene valor en el campo 'Manzana'.", "error");
        return;
    }

    filterExpression = '"Manzana" = ' + (typeof manzanaID === "string" ? "'" + manzanaID + "'" : manzanaID);

    activeLayer.selectByExpression(filterExpression);
    selectedCount = activeLayer.selectedFeatureCount();

    Qgis.message("Se seleccionaron " + selectedCount + " estructuras en la Manzana " + manzanaID, "success");

    populateFieldSelector();
    editDialog.open();

    Qgis.mapClicked.disconnect(onMapClick);
}

function populateFieldSelector() {
    var fields = activeLayer.fields();
    var editableFields = [];
    for (var i = 0; i < fields.length; i++) {
        if (activeLayer.isEditable()) {
            editableFields.push({ "display": fields[i].name, "field": fields[i].name });
        }
    }
    fieldSelector.model = editableFields;
}

function applyEdits(fieldToEdit, newValue) {
    if (!fieldToEdit || newValue === "") {
        Qgis.message("Debe seleccionar un campo y asignar un valor.", "error");
        return;
    }

    activeLayer.startEditing();

    var selectedFeatures = activeLayer.selectedFeatures();
    for (var i = 0; i < selectedFeatures.length; i++) {
        var f = selectedFeatures[i];
        f.setAttribute(fieldToEdit, newValue);
        activeLayer.updateFeature(f);
    }

    activeLayer.commitChanges();

    Qgis.message("Se actualizaron " + selectedFeatures.length + " registros en el campo " + fieldToEdit, "success");
}