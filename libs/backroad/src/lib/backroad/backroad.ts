// eslint-disable-next-line @nx/enforce-module-boundaries
import type {
  BackroadComponent,
  BackroadContainer,
  BackroadNode,
  ComponentPropsMapping,
  ContainerPropsMapping,
  GenericBackroadComponent,
  InbuiltComponentTypes,
  InbuiltContainerTypes,
} from 'backroad-core';
import { omit } from 'lodash';
import superjson from 'superjson';
import { BackroadSession } from '../server/sessions/session';
import { ObjectHasher } from './object-hasher';
type BackroadComponentFormat<ComponentType extends InbuiltComponentTypes> = {
  id?: BackroadComponent<ComponentType, false>['id'];
} & BackroadComponent<ComponentType, false>['args'] & {
    defaultValue?: BackroadComponent<ComponentType, true>['value'];
  };

type BackroadContainerFormat<ContainerType extends InbuiltContainerTypes> =
  BackroadContainer<ContainerType, false>['args'];

/**
 * Manages the addition of nodes to the tree and also returns vaulues where applicable
 */

export class BackroadNodeManager<
  ContainerType extends InbuiltContainerTypes = 'page'
> {
  constructor(
    public container: BackroadContainer<ContainerType, false>,
    private backroadSession: BackroadSession
  ) {}

  private getAutoGeneratedId<T extends InbuiltComponentTypes>(
    props: BackroadComponentFormat<T>,
    type: T
  ) {
    const autoGeneratedIdInputs = {
      ...omit(props, ['id', 'defaultValue']),
      type,
    };
    return ObjectHasher.hash(autoGeneratedIdInputs);
  }

  private constructContainerObject<T extends InbuiltContainerTypes>(
    props: BackroadContainerFormat<T>,
    type: T
  ) {
    const nodePath = this.getDescendantKey();
    const containerNode = {
      path: nodePath,
      args: props as unknown as ContainerPropsMapping[T]['args'],
      type: type,
    };

    return containerNode;
  }

  addContainerDescendant<ContainerType extends InbuiltContainerTypes>(
    containerNodeData: Omit<
      BackroadContainer<ContainerType>,
      'path' | 'children'
    > & {
      children?: BackroadContainer<ContainerType, false>['children'];
    }
  ) {
    const containerNode = {
      ...containerNodeData,
      path: this.getDescendantKey(),
      children: [],
    };
    this.container.children.push(containerNode);
    this.backroadSession.renderQueue.addToQueue(
      this.getRenderPayload(containerNode, this.backroadSession)
    );
    return new BackroadNodeManager(
      containerNode as BackroadContainer<ContainerType>,
      this.backroadSession
    );
  }

  // you should not have to call this manually
  // use initialiseAndAddComponentDescendant instead
  addComponentDescendant<ComponentType extends InbuiltComponentTypes>(
    nodeData: BackroadComponent<ComponentType, false>
  ) {
    const castedNodeData = nodeData as GenericBackroadComponent;
    this.container.children.push(castedNodeData);
    this.backroadSession.renderQueue.addToQueue(
      this.getRenderPayload(castedNodeData, this.backroadSession)
    );
    return this.backroadSession.valueOf<ComponentType>(nodeData.id);
  }
  // you should not have to call this manually
  // use initialiseAndAddComponentDescendant instead
  private initialiseAndConstructComponentObject<
    T extends InbuiltComponentTypes
  >(props: BackroadComponentFormat<T>, type: T) {
    const nodePath = this.getDescendantKey();
    const componentId = props.id || this.getAutoGeneratedId(props, type);
    this.backroadSession.setValueIfNotSet(componentId, props.defaultValue);
    const componentNode = {
      id: componentId,
      path: nodePath,
      args: omit(props, [
        'id',
        'type',
        'defaultValue',
      ]) as unknown as ComponentPropsMapping[T]['args'],
      type: type,
    };

    return componentNode;
  }
  initialiseAndAddComponentDescendant<T extends InbuiltComponentTypes>(
    props: BackroadComponentFormat<T>,
    type: T
  ) {
    return this.addComponentDescendant(
      this.initialiseAndConstructComponentObject(props, type)
    );
  }
  getRenderPayload(node: BackroadNode<false, false>, session: BackroadSession) {
    if ('id' in node) {
      return superjson.stringify({ ...node, value: session.valueOf(node.id) });
    }
    return superjson.stringify(node);
  }
  getDescendantKey() {
    return `${this.container.path ? this.container.path + '.' : ''}children.${
      this.container.children.length
    }`;
  }
  sidebar(props: BackroadContainerFormat<'sidebar'>) {
    return this.addContainerDescendant(
      this.constructContainerObject(props, 'sidebar')
    );
  }

  page(props: BackroadContainerFormat<'page'>) {
    return this.backroadSession.rootNodeManager.addContainerDescendant(
      this.constructContainerObject(props, 'page')
    );
  }
  columns(props: BackroadContainerFormat<'columns'>) {
    const columnsContainer = this.addContainerDescendant(
      this.constructContainerObject(props, 'columns')
    );
    return [...Array(props.columnCount)].map(() =>
      columnsContainer.addContainerDescendant({ type: 'base', args: {} })
    );
  }

  link(props: BackroadComponentFormat<'link'>) {
    return this.initialiseAndAddComponentDescendant(props, 'link');
  }
  linkGroup(props: BackroadComponentFormat<'link_group'>) {
    return this.initialiseAndAddComponentDescendant(props, 'link_group');
  }
  stats(props: BackroadComponentFormat<'stats'>) {
    return this.initialiseAndAddComponentDescendant(props, 'stats');
  }
  multiselect(props: BackroadComponentFormat<'multiselect'>) {
    const val = this.initialiseAndAddComponentDescendant(props, 'multiselect');

    return val;
  }
  json(props: BackroadComponentFormat<'json'>) {
    return this.initialiseAndAddComponentDescendant(props, 'json');
  }
  title(props: BackroadComponentFormat<'title'>) {
    return this.initialiseAndAddComponentDescendant(props, 'title');
  }

  button(props: BackroadComponentFormat<'button'>) {
    return this.initialiseAndAddComponentDescendant(props, 'button');
  }
  numberInput(props: BackroadComponentFormat<'number_input'>) {
    return this.initialiseAndAddComponentDescendant(props, 'number_input');
  }
  write(props: BackroadComponentFormat<'markdown'>) {
    return this.initialiseAndAddComponentDescendant(props, 'markdown');
  }
  line(props: BackroadComponentFormat<'line_chart'>) {
    return this.initialiseAndAddComponentDescendant(props, 'line_chart');
  }
  select(props: BackroadComponentFormat<'select'>) {
    return this.initialiseAndAddComponentDescendant(props, 'select');
  }
  image(props: BackroadComponentFormat<'image'>) {
    return this.initialiseAndAddComponentDescendant(props, 'image');
  }
}
