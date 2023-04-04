import * as React from 'react';
import { render } from 'react-dom';
import { useEffect, useMemo, useState } from 'react';
import ReactJson from 'react-json-view'

function App() {
  const [configuration, setConfiguration] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    window.addEventListener('message', (event) => {
      setMessages((messages) => [event.data, ...messages]);
      if (event.data && event.data.name === 'elfsquad.configurationUpdated') {
        setConfiguration(event.data.args);
      }
    });
  }, []);

  const selectableNodes = useMemo(() => {
    if (!configuration) {
      return;
    }

    const nodes = [];
    const stack = configuration.steps.flatMap((step) => step.features);
    while (stack.length > 0) {
      const node = stack.pop();
      nodes.push(node);
      if (node.features) {
        stack.push(...node.features);
      }
    }

    return nodes;
  }, [configuration]);

  const postMessage = (name: string, args: any) => {
    window.top.postMessage({ name: name, args: args }, '*');
  };

  useEffect(() => {
    postMessage('elfsquad.triggerConfigurationUpdated', {});
  }, []);

  const triggerHeader = (name: string, onClick: () => void) => {
    return <div className="flex justify-between w-1/2 items-center w-full">
      <h2>{name}</h2>
      <button onClick={onClick} className="bg-blue-400 py-2 px-4">Trigger</button>
    </div>
  };

  const triggerConfigurationUpdated = () => {
    postMessage('elfsquad.triggerConfigurationUpdated', {});
  }

  const [updateRequirementNodeId, setUpdateRequirementNodeId] = useState(null);
  const [updateRequirementValue, setUpdateRequirementValue] = useState(null);
  const [updateRequirementIsSelection, setUpdateRequirementIsSelection] = useState(null);

  const updateRequirement = () => {
    const obj = {
      nodeId: updateRequirementNodeId,
      value: updateRequirementValue,
      isSelection: updateRequirementIsSelection,
      ignoreConflicts: true,
      includeSearchbarResults: true,
    };
    postMessage('elfsquad.updateRequirement', obj);
  }

  const [updateRequirementsNodeId, setUpdateRequirementsNodeId] = useState(null);
  const [updateRequirementsValue, setUpdateRequirementsValue] = useState(null);
  const [updateRequirementsIsSelection, setUpdateRequirementsIsSelection] = useState(null);

  const updateRequirements = () => {
    const obj = {
      requirements: [{
        nodeId: updateRequirementsNodeId,
        value: updateRequirementsValue,
        isSelection: updateRequirementsIsSelection
      }],
      ignoreConflicts: true,
      includeSearchbarResults: true,
    }
    postMessage('elfsquad.updateRequirements', obj);
  }

  const selectableImageNodes = useMemo(() => {
    if (!selectableNodes) {
      return [];
    }

    return selectableNodes.filter((node) => node.featureType === 4);
  }, [selectableNodes]);

  const [updateImageValueNodeId, setUpdateImageValueNodeId] = useState(null);
  const [updateImageImageBase64, setUpdateImageImageBase64] = useState(null);

  const updateImageValue = () => {
    const obj = {
      name: 'elfsquad.updateImageValue',
      args: {
        nodeId: updateImageValueNodeId,
        image: updateImageImageBase64,
      }
    };
    postMessage('elfsquad.updateImageValue', obj);
  }

  return <div className="flex p-4 gap-16">
    <div className="w-1/2 flex flex-col gap-4">
      <div className="bg-gray-200 p-4">
        {triggerHeader('elfsquad.triggerConfigurationUpdated', triggerConfigurationUpdated)}
      </div>

      <div className="flex flex-col gap-4 bg-gray-200 p-4">
        {triggerHeader('elfsquad.updateRequirement', updateRequirement)}
        <div>
          <div className="flex justify-between gap-16">
            <label>Node: </label>
            <select className="w-full" onChange={(event) => setUpdateRequirementNodeId(event.target.value)}>
              <option value="">Select a node</option>
              {selectableNodes && selectableNodes.map((node) => <option value={node.id}>{node.name}</option>)}
            </select>
          </div>

          <div className="flex justify-between gap-16">
            <label>Value: </label>
            <input className="w-full" onChange={(event) => setUpdateRequirementValue(event.target.value)} />
          </div>

          <div className="flex justify-between gap-16">
            <label>Is Selection</label>
            <input type="checkbox" onChange={(event) => setUpdateRequirementIsSelection(event.target.checked)} />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 bg-gray-200 p-4">
        {triggerHeader('elfsquad.updateRequirements', updateRequirements)}
        <div>
          <div className="flex justify-between gap-16">
            <label>Node: </label>
            <select className="w-full" onChange={(event) => setUpdateRequirementsNodeId(event.target.value)}>
              <option value="">Select a node</option>
              {selectableNodes && selectableNodes.map((node) => <option value={node.id}>{node.name}</option>)}
            </select>
          </div>

          <div className="flex justify-between gap-16">
            <label>Value: </label>
            <input className="w-full" onChange={(event) => setUpdateRequirementsValue(event.target.value)} />
          </div>

          <div className="flex justify-between gap-16">
            <label>Is Selection</label>
            <input type="checkbox" onChange={(event) => setUpdateRequirementsIsSelection(event.target.checked)} />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 bg-gray-200 p-4">
        {triggerHeader('elfsquad.updateImageValue', updateImageValue)}
        <div>
          <div className="flex justify-between gap-16">
            <label>Node: </label>
            <select className="w-full" onChange={(event) => setUpdateImageValueNodeId(event.target.value)}>
              <option value="">Select a node</option>
              {selectableImageNodes && selectableImageNodes.map((node) => <option value={node.id}>{node.name}</option>)}
            </select>
          </div>
          <div className="flex justify-between gap-16">
            <label>Image: </label>
            <input type="file" onChange={(event) => {
              const file = event.target.files[0];
              const reader = new FileReader();
              reader.onload = (event) => {
                setUpdateImageImageBase64(event.target.result);
              };
              reader.readAsDataURL(file);
            }} />
          </div>
        </div>
      </div>
    </div>

    <div>
      <h2>Messages</h2>
      <ReactJson src={messages} collapsed={true} />
    </div>
  </div>
}

const container = document.querySelector('#root');
render(<App />, container);

