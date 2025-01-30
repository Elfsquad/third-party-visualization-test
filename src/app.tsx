import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import ReactJson from 'react-json-view';
import { EventSender } from '@elfsquad/third-party-visualization';
import { Configuration } from '@elfsquad/configurator';
import { render } from 'react-dom';

function App() {
  const [configuration, setConfiguration] = useState<Configuration | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [eventSender, setEventSender] = useState<EventSender | null>(null);

  useEffect(() => {
    console.log('Adding event listener');
    const handleMessage = (event) => {
      console.log('Received message', event.data);
      setMessages((messages) => [event.data, ...messages]);
      if (event.data && event.data.name === 'elfsquad.configurationUpdated') {
        console.log('Configuration updated', event.data.args);
        setConfiguration(event.data.args);
      }
    };

    window.addEventListener('message', handleMessage);

    // Initialize EventSender
    if (window.top) {
      setEventSender(new EventSender(window.top));
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const selectableNodes = useMemo(() => {
    if (!configuration) {
      return;
    }

    const nodes = [] as any[]
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

  useEffect(() => {
    if (eventSender) {
      eventSender.sendTriggerConfigurationUpdate();
    }
  }, [eventSender]);

  const triggerHeader = (name: string, onClick: () => void) => {
    return (
      <div className="flex justify-between w-1/2 items-center w-full">
        <h2>{name}</h2>
        <button onClick={onClick} className="bg-blue-400 py-2 px-4">
          Trigger
        </button>
      </div>
    );
  };

  const triggerConfigurationUpdated = () => {
    if (eventSender) {
      eventSender.sendTriggerConfigurationUpdate();
    }
  };

  const [updateRequirementNodeId, setUpdateRequirementNodeId] = useState<string | null>(null);
  const [updateRequirementValue, setUpdateRequirementValue] = useState<number | null>(null);
  const [updateRequirementConfigurationId, setUpdateRequirementConfigurationId] = useState<string | null>(null);
  const [updateRequirementIsSelection, setUpdateRequirementIsSelection] = useState<boolean | null>(null);

  const updateRequirement = () => {
    if (eventSender) {
      eventSender.sendUpdateRequirement({
        nodeId: updateRequirementNodeId as string,
        value: updateRequirementValue as number,
        isSelection: updateRequirementIsSelection as boolean,
        ignoreConflicts: true,
        configurationId: updateRequirementConfigurationId ?? configuration?.id,
      });
    }
  };

  const [updateRequirementsNodeId, setUpdateRequirementsNodeId] = useState<string | null>(null);
  const [updateRequirementsValue, setUpdateRequirementsValue] = useState<number | null>(null);
  const [updateRequirementsIsSelection, setUpdateRequirementsIsSelection] = useState<boolean | null>(null);

  const updateRequirements = () => {
    if (eventSender) {
      eventSender.sendUpdateRequirements({
        requirements: [
          {
            nodeId: updateRequirementsNodeId as string,
            value: updateRequirementsValue as number,
            isSelection: updateRequirementsIsSelection as boolean,
          },
        ],
        ignoreConflicts: true,
        includeSearchbarResults: true,
        configurationId: configuration?.id,
      });
    }
  };

  const linkedConfigurations = useMemo(() => {
    if (!configuration) {
      return [];
    }

    return configuration.linkedConfigurations;
  }, [configuration]);

  const linkedFeatureModels = useMemo(() => {
    if (!configuration) {
      return [];
    }

    return configuration.linkedConfigurationModels;
  }, [configuration]);

  const [updateTextValueNodeId, setUpdateTextValueNodeId] = useState<string | null>(null);
  const [updateTextValueTextValue, setUpdateTextValueTextValue] = useState<string | null>(null);

  const updateTextValue = () => {
    if (eventSender) {
      eventSender.sendUpdateTextValue({
        nodeId: updateTextValueNodeId as string,
        value: updateTextValueTextValue as string,
        configurationId: configuration?.id as string,
      });
    }
  };

  const selectableImageNodes = useMemo(() => {
    if (!selectableNodes) {
      return [];
    }

    return selectableNodes.filter((node) => node.featureType === 4);
  }, [selectableNodes]);

  const [updateImageValueNodeId, setUpdateImageValueNodeId] = useState<string | null>(null);
  const [updateImageImageBase64, setUpdateImageImageBase64] = useState<string | null>(null);

  const updateImageValue = () => {
    if (eventSender) {
      eventSender.sendUpdateImageValue({
        nodeId: updateImageValueNodeId as string,
        image: updateImageImageBase64 as string,
        configurationId: configuration?.id as string,
      });
    }
  };

  const [updateLinkedConfigurationCardinalityParentNodeId, setUpdateLinkedConfigurationCardinalityParentNodeId] = useState<string | null>(null);
  const [updateLinkedConfigurationCardinalityCardinality, setUpdateLinkedConfigurationCardinalityCardinality] = useState<number | null>(null);

  const updateLinkedConfigurationCardinality = () => {
    if (eventSender) {
      eventSender.sendUpdateLinkedConfigurationCardinality({
        configurationId: configuration?.id as string,
        parentNodeId: updateLinkedConfigurationCardinalityParentNodeId as string,
        cardinality: updateLinkedConfigurationCardinalityCardinality as number,
      });
    }
  }

  const [removeLinkedConfigurationId, setRemoveLinkedConfigurationId] = useState<string | null>(null);

  const removeLinkedConfiguration = () => {
    if (eventSender) {
      eventSender.sendRemoveLinkedConfiguration({
        linkedConfigurationId: removeLinkedConfigurationId as string,
      });
    }
  };

  return (
    <div className="flex p-4 gap-16">
      <div className="w-1/2 flex flex-col gap-4">
        <div className="bg-gray-200 p-4">
          {triggerHeader('elfsquad.triggerConfigurationUpdated', triggerConfigurationUpdated)}
        </div>

        <div className="flex flex-col gap-4 bg-gray-200 p-4">
          {triggerHeader('elfsquad.updateRequirement', updateRequirement)}
          <div>
            <div className="flex justify-between gap-16">
              <label>Node: </label>
              <select
                className="w-full"
                onChange={(event) => setUpdateRequirementNodeId(event.target.value)}
              >
                <option value="">Select a node</option>
                {selectableNodes &&
                  selectableNodes.map((node) => (
                    <option key={node.id} value={node.id}>
                      {node.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex justify-between gap-16">
              <label>Value: </label>
              <input
                className="w-full"
                onChange={(event) => setUpdateRequirementValue(parseInt(event.target.value))}
              />
            </div>

            <div className="flex justify-between gap-16">
              <label>Is Selection</label>
              <input
                type="checkbox"
                onChange={(event) => setUpdateRequirementIsSelection(event.target.checked)}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 bg-gray-200 p-4">
          {triggerHeader('elfsquad.updateRequirement', updateRequirement)}
          
          <div>
            <div className="flex justify-between gap-16">
              <label>Configuration: </label>
              <select className="w-full" onChange={(event) => setUpdateRequirementConfigurationId(event.target.value)}>
                <option value="">Select a configuration</option>
                {linkedConfigurations &&
                  linkedConfigurations.map((node) => (
                    <option key={node.linkedConfigurationId} value={node.linkedConfigurationId}>
                      {node.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex justify-between gap-16">
              <label>Node id: </label>
              <input
                className="w-full"
                onChange={(event) => setUpdateRequirementNodeId(event.target.value)}
              />
            </div>

            <div className="flex justify-between gap-16">
              <label>Value: </label>
              <input
                className="w-full"
                onChange={(event) => setUpdateRequirementValue(parseInt(event.target.value))}
              />
            </div>
              
          </div>
        </div>

        <div className="flex flex-col gap-4 bg-gray-200 p-4">
          {triggerHeader('elfsquad.updateTextValue', updateTextValue)}
          <div>
            <div className="flex justify-between gap-16">
              <label>Node: </label>
              <select
                className="w-full"
                onChange={(event) => setUpdateTextValueNodeId(event.target.value)}
              >
                <option value="">Select a node</option>
                {selectableNodes &&
                  selectableNodes.map((node) => (
                    <option key={node.id} value={node.id}>
                      {node.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex justify-between gap-16">
              <label>Text value: </label>
              <input
                className="w-full"
                onChange={(event) => setUpdateTextValueTextValue(event.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 bg-gray-200 p-4">
          {triggerHeader('elfsquad.updateRequirements', updateRequirements)}
          <div>
            <div className="flex justify-between gap-16">
              <label>Node: </label>
              <select
                className="w-full"
                onChange={(event) => setUpdateRequirementsNodeId(event.target.value)}
              >
                <option value="">Select a node</option>
                {selectableNodes &&
                  selectableNodes.map((node) => (
                    <option key={node.id} value={node.id}>
                      {node.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex justify-between gap-16">
              <label>Value: </label>
              <input
                className="w-full"
                onChange={(event) => setUpdateRequirementsValue(parseInt(event.target.value))}
              />
            </div>

            <div className="flex justify-between gap-16">
              <label>Is Selection</label>
              <input
                type="checkbox"
                onChange={(event) => setUpdateRequirementsIsSelection(event.target.checked)}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 bg-gray-200 p-4">
          {triggerHeader('elfsquad.updateImageValue', updateImageValue)}
          <div>
            <div className="flex justify-between gap-16">
              <label>Node: </label>
              <select
                className="w-full"
                onChange={(event) => setUpdateImageValueNodeId(event.target.value)}
              >
                <option value="">Select a node</option>
                {selectableImageNodes &&
                  selectableImageNodes.map((node) => (
                    <option key={node.id} value={node.id}>
                      {node.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex justify-between gap-16">
              <label>Image: </label>
              <input
                type="file"
                onChange={(event) => {
                  const file = event.target.files![0]
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    // @ts-ignore
                    setUpdateImageImageBase64(event.target.result);
                  };
                  reader.readAsDataURL(file);
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 bg-gray-200 p-4">
          {triggerHeader('elfsquad.updateLinkedConfigurationCardinality', updateLinkedConfigurationCardinality)}


          <div>
            <div className="flex justify-between gap-16">
              <label>Configuration ID: </label>
              <select className="w-full" onChange={(event) => setUpdateLinkedConfigurationCardinalityParentNodeId(event.target.value)}>
                <option value="">Select a model</option>
                {linkedFeatureModels && linkedFeatureModels.map((m) => (
                  <option key={m.parentNodeId} value={m.parentNodeId}>
                    {m.configurationModelName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-between gap-16">
              <label>Cardinality: </label>
              <input
                className="w-full"
                onChange={(event) => setUpdateLinkedConfigurationCardinalityCardinality(parseInt(event.target.value))}
              />
            </div>
          </div>

        </div>

        <div className="flex flex-col gap-4 bg-gray-200 p-4">
          {triggerHeader('elfsquad.removeLinkedConfiguration', removeLinkedConfiguration)}

          <div>
            <div className="flex justify-between gap-16">
              <label>Configuration ID: </label>
              <select className="w-full" onChange={(event) => setRemoveLinkedConfigurationId(event.target.value)}>
                <option value="">Select a configuration</option>
                {linkedConfigurations &&
                  linkedConfigurations.map((c) => (
                    <option key={c.linkedConfigurationId} value={c.linkedConfigurationId}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2>Messages</h2>
        <ReactJson src={messages} collapsed={true} />
      </div>
    </div>
  );
}

const container = document.querySelector('#root');
render(<App />, container);
