// CAMBIO: Se importan las librerías de QGIS
.import "qgis" as QGis
.import "qgis.core" as QGisCore

// Variable para mantener una referencia a la capa activa durante la operación
var activeLayer = null;

// Función principal que inicia la herramienta de selección
function startSelection(dialog, fieldComboBox, valueTextField) {
    activeLayer = QGis.iface.activeLayer(); // CAMBIO: API correcta para obtener capa activa

    // Validar que la capa es la correcta
    if (!activeLayer || activeLayer.name !== "Estructuras Nuevas") {
        QGis.iface.messageBar().pushMessage("Error", "Por favor, selecciona la capa 'Estructuras Nuevas'.", QGis.MessageLevel.Critical, 3);
        return;
    }

    // Limpiar el formulario anterior
    valueTextField.text = "";

    // CAMBIO: Usar PointMapTool es el método moderno y correcto
    QGis.iface.mapCanvas().setMapTool(QGis.MapTool.PointMapTool, {
        onPointCaptured: function(point, mouseButton) {
            // Identificar el objeto en el punto donde se tocó (de forma asíncrona)
            activeLayer.featureAt(point, {
                onFinished: function(feature) {
                    if (!feature.isValid()) {
                        QGis.iface.messageBar().pushMessage("Info", "No se encontró ninguna estructura en ese punto.", QGis.MessageLevel.Info, 2);
                        return;
                    }

                    const manzanaID = feature.attribute("Manzana");

                    if (!manzanaID) {
                        QGis.iface.messageBar().pushMessage("Advertencia", "La estructura no tiene valor en 'Manzana'.", QGis.MessageLevel.Warning, 3);
                        return;
                    }

                    const filterExpression = `"Manzana" = '${manzanaID}'`;

                    activeLayer.selectByExpression(filterExpression);
                    const selectedCount = activeLayer.selectedFeatureCount();

                    QGis.iface.messageBar().pushMessage("Éxito", `Seleccionadas ${selectedCount} estructuras en Manzana ${manzanaID}.`, QGis.MessageLevel.Success, 4);

                    populateFieldSelector(fieldComboBox, activeLayer);
                    dialog.open();
                }
            });

            // Desactivar la herramienta para no seguir seleccionando
            QGis.iface.mapCanvas().unsetMapTool();
        }
    });
}

// Función para llenar el selector de campos
function populateFieldSelector(comboBox, layer) {
    const fields = layer.fields();
    var fieldNames = [];
    // CAMBIO: La forma correcta de iterar sobre los campos
    for (var i = 0; i < fields.count; ++i) {
        const field = fields.at(i);
        // Excluir campos que no son editables
        if (!field.isReadOnly()) {
            fieldNames.push(field.name());
        }
    }
    comboBox.model = fieldNames;
}

// Función para aplicar la edición masiva
function applyMassiveEdit(fieldToEdit, newValue, dialog) {
    if (!activeLayer) return;

    if (!fieldToEdit || newValue.trim() === "") {
        QGis.iface.messageBar().pushMessage("Error", "Debes seleccionar un campo y proporcionar un valor.", QGis.MessageLevel.Critical, 3);
        return;
    }

    activeLayer.startEditing();

    const selectedFeatures = activeLayer.selectedFeatures();
    for (var i = 0; i < selectedFeatures.length; i++) {
        let feature = selectedFeatures[i];
        feature.setAttribute(fieldToEdit, newValue);
        activeLayer.updateFeature(feature);
    }

    // CAMBIO: Usar callbacks para manejar el resultado de guardar los cambios
    activeLayer.commitChanges({
        onSuccess: function() {
            QGis.iface.messageBar().pushMessage("Éxito", `Se actualizaron ${selectedFeatures.length} estructuras.`, QGis.MessageLevel.Success, 3);
            activeLayer.removeSelection(); // Limpiar selección
            dialog.close(); // Cerrar el diálogo solo si fue exitoso
        },
        onError: function(error) {
            QGis.iface.messageBar().pushMessage("Error", `No se pudieron guardar los cambios: ${error}`, QGis.MessageLevel.Critical, 5);
            activeLayer.rollBack(); // Revertir si hay error
        }
    });
}
