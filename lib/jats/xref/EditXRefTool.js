import { Tool } from 'substance'
import clone from 'lodash/clone'
import find from 'lodash/find'
import without from 'lodash/without'
import getXRefTargets from './getXRefTargets'

/*
  Editing of XRefTargets
*/
class EditXRefTool extends Tool {

  getInitialState() {
    return {
      targets: getXRefTargets(this.props.node, this.context.labelGenerator)
    }
  }

  // this.willReceiveProps = function() {
  //   console.log('XRefTargets.willReceiveProps', this.__id__);
  // };

  // this.dispose = function() {
  //   console.log('XRefTargets.dispose', this.__id__);
  // };

  render($$) {
    let el = $$('div').addClass('sc-edit-xref-tool')
    let componentRegistry = this.context.componentRegistry

    this.state.targets.forEach(function(target) {
      let TargetComponent = componentRegistry.get(target.node.type+'-target')
      let props = clone(target)
      // Disable editing in TargetComponent
      props.disabled = true
      el.append(
        $$(TargetComponent, props)
          .on('click', this._toggleTarget.bind(this, target.node))
      )
    }.bind(this))
    return el
  }

  _toggleTarget(targetNode) {
    let node = this.props.node
    let editorSession = this.context.editorSession
    // console.log('XRefTargets: toggling target of ', node.id);

    // Update model
    let newTargets = node.targets
    if (newTargets.indexOf(targetNode.id) >= 0) {
      newTargets = without(newTargets, targetNode.id)
    } else {
      newTargets.push(targetNode.id)
    }

    // Compute visual feedback
    let targets = this.state.targets;
    let target = find(this.state.targets, function(t) {
      return t.node === targetNode
    })

    // Flip the selected flag
    target.selected = !target.selected

    editorSession.transaction(function(tx) {
      tx.set([node.id, 'targets'], newTargets)
    })

    // Triggers a rerender
    this.setState({
      targets: targets
    })
  }
}

export default EditXRefTool


/*
  Shown in OverlayTools
*/
// class EditXRefTool extends Tool {
//   constructor(...args) {
//     super(...args)
//     this.handleActions({
//       'closeModal': this._doneEditing,
//       'doneEditing': this._doneEditing
//     })
//   }
//
//   render($$) {
//     let Modal = this.getComponent('modal')
//     let Button = this.getComponent('button')
//
//     let node = this.props.node
//     let el = $$('div').addClass('sc-edit-xref-tool')
//
//     el.append(
//       $$(Button, {
//         icon: 'edit',
//         style: this.props.style
//       })
//       .attr('title', this.getLabel('edit-xref'))
//       .on('click', this._onEdit),
//       $$(Button, {
//         icon: 'delete',
//         style: this.props.style
//       })
//       .attr('title', this.getLabel('delete-xref'))
//       .on('click', this._onDelete)
//     )
//
//     if (this.state.edit) {
//       el.append(
//         $$(Modal, {
//           width: 'large'
//         }).append(
//           $$(XRefTargets, {
//             node: node
//           }).ref('targets')
//         )
//       )
//     }
//     return el;
//   }
//
//   _onEdit() {
//     this.setState({
//       edit: true
//     })
//   }
//
//   _doneEditing() {
//     this.setState({
//       edit: false
//     })
//   }
//
//   _onDelete() {
//     var editorSession = this.context.editorSession;
//     editorSession.transaction(function(tx) {
//       tx.deleteSelection()
//     })
//   }
// }
//
// export default EditXRefTool;
