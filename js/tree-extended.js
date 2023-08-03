toggleSelection = (tree, ids, state) => {
  if(Array.isArray(ids)) {
    for (var id of ids) {
      id = tree.node_map[id].id;
      console.log("node selection id: " + id);
      tree.node_elements[0].filter(o => o.id == id)[0].__data__.selected = state;
    }
  } else {
    var id = ids;
    id = tree.node_map[id].id;
    console.log("node selection id: " + id);
    tree.node_elements[0].filter(o => o.id == id)[0].__data__.selected = state;
  }
  tree.clearSelection(true);
  tree._updateSelectionStatus();
}

D3MSTree.prototype.selectNodesByIds = function(ids) {
  toggleSelection(this, ids, true);
}

D3MSTree.prototype.unselectNodesByIds = function(ids) {
  toggleSelection(this, ids, false);
}