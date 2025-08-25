import QtQuick 2.15
import QtQuick.Controls 2.15
import org.qgis 1.0

ToolButton {
    id: manzanaToolsButton
    text: "MT"
    icon.name: "edit-select"
    checkable: false
    onClicked: {
        ManzanaToolsLogic.activateTool()
    }

    Dialog {
        id: editDialog
        title: "Edición Masiva"
        modal: true
        standardButtons: DialogButtonBox.Cancel
        visible: false

        Column {
            spacing: 12
            padding: 16

            ComboBox {
                id: fieldSelector
                width: parent.width
                model: []
                textRole: "display"
                valueRole: "field"
                placeholderText: "Selecciona un campo"
            }

            TextField {
                id: valueInput
                width: parent.width
                placeholderText: "Nuevo valor"
            }

            Row {
                spacing: 16
                Button {
                    text: "Aplicar"
                    onClicked: {
                        ManzanaToolsLogic.applyEdits(fieldSelector.currentValue, valueInput.text)
                        editDialog.close()
                    }
                }
                Button {
                    text: "Cancelar"
                    onClicked: editDialog.close()
                }
            }
        }
    }

    Component.onCompleted: {
        ManzanaToolsLogic.init(editDialog, fieldSelector, valueInput)
    }
}