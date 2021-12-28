// //Import DecisionTree
// var DecisionTree = require('decision-tree');
//
// //Create training data
// //Test data is compared to this data to check accuracy
// //Predictions are made on this data to give results
// var training_data = [
//     {"color":"blue", "shape":"square", "liked":false},
//     {"color":"red", "shape":"square", "liked":false},
//     {"color":"blue", "shape":"circle", "liked":true},
//     {"color":"red", "shape":"circle", "liked":true},
//     {"color":"blue", "shape":"hexagon", "liked":false},
//     {"color":"red", "shape":"hexagon", "liked":false},
//     {"color":"yellow", "shape":"hexagon", "liked":true},
//     {"color":"yellow", "shape":"circle", "liked":true}
// ];
//
// //Used to check the accuracy of the model
// var test_data = [
//         {"color":"blue", "shape":"hexagon", "liked":false},
//         {"color":"red", "shape":"hexagon", "liked":false},
//         {"color":"yellow", "shape":"hexagon", "liked":true},
//         {"color":"yellow", "shape":"circle", "liked":true}
// ];
//
// var class_name = "liked";
//
//
// var features = ["color", "shape"];
//
// var dt = new DecisionTree(class_name, features);
//
//
// dt.train(training_data);
//
//
// var predicted_class = dt.predict({
//     color: "blue",
//     shape: "hexagon"
// });
//
//
// var accuracy = dt.evaluate(test_data);
//
//
// console.log("dt:", dt);
// console.log("predicted_class:", predicted_class);
// console.log("Accuracy:", accuracy);
//
// /* Import/Export trained model
// //To export (save) trained model for future use
// var treeJson = dt.toJSON();
// console.log("treeJson: ", treeJson);
// //Create a new model
// var treeJson = dt.toJSON();
// var preTrainedDecisionTree = new DecisionTree(treeJson);
// //Alternately, you can also import a previously trained model on an existing tree instance,
// assuming the features & class are the same:
// var treeJson = dt.toJSON();
// dt.import(treeJson);
// */
