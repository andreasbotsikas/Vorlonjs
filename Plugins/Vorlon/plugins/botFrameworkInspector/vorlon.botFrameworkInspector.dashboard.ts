﻿/// <reference path="botbuilder.d.ts" />

module VORLON {
    export class BotFrameworkInspectorDashboard extends DashboardPlugin {
        private _blocksDefinition = `callstack0=>condition: 0|timeline`;
        private _callstacksGraphDefinition = [];
        private _chart;

        constructor() {
            super("botFrameworkInspector", "control.html", "control.css");
            this._ready = false;
            this._id = "BOTFRAMEWORKINSPECTOR";
        }

        private _lastReceivedBotInfo: BotInfo;
        private _dialogsContainer: HTMLDivElement;
        private _dialogStacksContainer: HTMLDivElement;

        public startDashboardSide(div: HTMLDivElement = null): void {
            this._insertHtmlContentAsync(div, (filledDiv) => {
                this._dialogsContainer = <HTMLDivElement>document.getElementById("dialogs");
                this._dialogStacksContainer = <HTMLDivElement>document.getElementById("dialogstacks");

                $("#menu").on("click", "li#display-dialog", function(event){
                    $("#dialogs").removeClass("hidden");  
                    $("#dialogstacks").addClass("hidden");  
                    $("#display-dialog").addClass("selected");  
                    $("#display-dialogstacks").removeClass("selected");  
                });

                $("#menu").on("click", "li#display-dialogstacks", function(event){
                    $("#dialogs").addClass("hidden");
                    $("#dialogstacks").removeClass("hidden"); 
                    $("#display-dialog").removeClass("selected");  
                    $("#display-dialogstacks").addClass("selected"); 
                });

                this._ready = true;
                this.display();
            });
        }

        public onRealtimeMessageReceivedFromClientSide(receivedObject: any): void {
            this._lastReceivedBotInfo = receivedObject;
            this.display();
        }

        public display() {
            if (this._lastReceivedBotInfo) {

                this._dialogsContainer.innerHTML = null;
                this._lastReceivedBotInfo.dialogDataList.forEach((dataList) => {
                    var dialog = document.createElement("div");
                    dialog.classList.add("dialog");
                    
                    var dialogid = document.createElement("p");
                    dialogid.innerText = dataList.id;
                    dialogid.classList.add("dialog-id");
                    dialog.appendChild(dialogid);

                    var dialogDetail = document.createElement("div");
                    dialogDetail.classList.add("dialog-detail");
                    dialog.appendChild(dialogDetail);

                    var waterfallStepsLabel = document.createElement("p");
                    waterfallStepsLabel.innerText = "Waterfall steps : ";
                    dialogDetail.appendChild(waterfallStepsLabel);

                    var waterfallSteps = document.createElement("div");
                    waterfallSteps.classList.add("waterfall-steps");
                    dialogDetail.appendChild(waterfallSteps);

                     if (dataList.dialog && dataList.dialog.length) {
                        if(dataList.dialog.length > 0){
                            for(var i = 0; i < dataList.dialog.length; i++){
                                var waterfallStep = document.createElement("div");
                                waterfallStep.classList.add("waterfall-step");
                                waterfallStep.innerText = (i + 1).toString();
                                waterfallSteps.appendChild(waterfallStep);
                            }
                        }
                        else {
                            waterfallStepsLabel.innerText += " none.";
                        }
                    }
                    else {
                        waterfallStepsLabel.innerText += " none.";
                    }

                    this._dialogsContainer.appendChild(dialog);
                });

                if(this._lastReceivedBotInfo.dialogStackHistory && this._lastReceivedBotInfo.dialogStackHistory.length){
                    this._dialogStacksContainer.innerHTML = null;
                    this._lastReceivedBotInfo.dialogStackHistory.forEach((botDialogStack) => {
                        var userEntry = document.createElement("div");
                        userEntry.classList.add("user-entry");
                        
                        var entry = document.createElement("p");
                        entry.classList.add("entry");
                        entry.innerHTML = "<strong>User entry:</strong> " + botDialogStack.message.text;
                        userEntry.appendChild(entry);

                        var stacks = document.createElement("div");
                        stacks.classList.add("stacks");
                        userEntry.appendChild(stacks);

                        //loop on each stack: one for now
                            var stack = document.createElement("div");
                            stack.classList.add("stack");
                            stacks.appendChild(stack);

                            var dialogsInStack = document.createElement("div");
                            dialogsInStack.classList.add("dialogs-in-stack");
                            stack.appendChild(dialogsInStack);

                            if(botDialogStack.sessionState.callstack && botDialogStack.sessionState.callstack.length > 0){
                                //loop on each dialog in the stack
                                var lineSeparator:HTMLDivElement;
                                botDialogStack.sessionState.callstack.forEach((dialog) => {
                                    var dialogInStack = document.createElement("div");
                                    dialogInStack.classList.add("dialog-in-stack");
                                    dialogInStack.innerText = dialog.id;
                                    dialogsInStack.appendChild(dialogInStack);

                                    lineSeparator = document.createElement("div");
                                    lineSeparator.classList.add("line");
                                    dialogsInStack.appendChild(lineSeparator);
                                });

                                //remove last line
                                lineSeparator.remove();
                            }
                            else {
                                dialogsInStack.innerText = "No dialog stack.";
                            }

                            console.log(botDialogStack.message);

                            var userData = document.createElement("div");
                            userData.classList.add("data");
                            userData.innerHTML = "<p><strong>ConversationData:</strong> " + JSON.stringify(botDialogStack.conversationData) + "</p>";
                            userData.innerHTML += "<p><strong>DialogData:</strong> " + JSON.stringify(botDialogStack.dialogData) + "</p>";
                            userData.innerHTML += "<p><strong>PrivateConversationData:</strong> " + JSON.stringify(botDialogStack.privateConversationData) + "</p>";
                            userData.innerHTML += "<p><strong>UserData:</strong> " + JSON.stringify(botDialogStack.userData) + "</p>";
                            stack.appendChild(userData);

                        this._dialogStacksContainer.appendChild(userEntry);
                        
                    console.log(botDialogStack.sessionState);
                });
                }
            }
        }
    }

    //Register the plugin with vorlon core 
    Core.RegisterDashboardPlugin(new BotFrameworkInspectorDashboard());
}

interface Window {
    flowchart: FlowChart;
}

interface FlowChart {
    parse(code: string): any;
};