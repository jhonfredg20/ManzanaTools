import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Layouts 1.15
import qgis.core 1.0
import qgis.gui 1.0

// CAMBIO: Importamos el archivo JS para poder llamarlo
import "ManzanaToolsLogic.js" as Logic

// CAMBIO: El archivo debe empezar con un componente "Plugin"
Plugin {
    id: root

    // CAMBIO: Se define que el plugin agregará un componente a la barra de herramientas
    PluginComponent {
    type: "ToolBar"
    // La línea "enabled:" ha sido eliminada. El componente siempre estará activo.

    ToolButton {
        id: toolButton
        icon.source: "qrc:/qgis/images/themes/default/mActionSelect.svg"
        text: "Manzana"
        tooltip: "Seleccionar y editar estructuras por manzana"

        onClicked: {
            Logic.startSelection(editDialog, fieldSelector, valueInput);
        }
    }
}
    // El diálogo se mantiene, pero ahora está dentro del componente Plugin
    Dialog {
        id: editDialog
        title: "Edición Masiva por Manzana"
        modal: true
        width: parent.width * 0.8
        height: contentLayout.implicitHeight + 40
        anchors.centerIn: parent
        standardButtons: Dialog.NoButton
        visible: false

        ColumnLayout {
            id: contentLayout
            width: parent.width

            Label {
                text: "Elija el campo y el nuevo valor para todos los objetos seleccionados."
                wrapMode: Text.WordWrap
                Layout.fillWidth: true
            }

            ComboBox {
                id: fieldSelector
                Layout.fillWidth: true
                model: []
            }

            TextField {
                id: valueInput
                placeholderText: "Escriba el nuevo valor aquí"
                Layout.fillWidth: true
            }

            RowLayout {
                Layout.alignment: Qt.AlignRight
                
                Button {
                    text: "Cancelar"
                    onClicked: editDialog.close()
                }

                Button {
                    text: "Aplicar Cambios"
                    highlighted: true
                    onClicked: {
                        // CAMBIO: Llamamos a la función de aplicar y le pasamos los valores
                        Logic.applyMassiveEdit(fieldSelector.currentValue, valueInput.text, editDialog);
                    }
                }
            }
        }
    }
}
