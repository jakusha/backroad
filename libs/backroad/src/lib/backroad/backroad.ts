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
type BackroadComponentFormat<ComponentType extends InbuiltComponentTypes> = {
  id?: BackroadComponent<ComponentType, false>['id'];
} & BackroadComponent<ComponentType, false>['args'];

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
  private constructComponentObject<T extends InbuiltComponentTypes>(
    props: BackroadComponentFormat<T>,
    type: T
  ) {
    const nodePath = this.getDescendantKey();
    const componentNode = {
      id: props.id || nodePath,
      path: nodePath,
      args: omit(props, [
        'id',
        'type',
      ]) as unknown as ComponentPropsMapping[T]['args'],
      type: type,
    };

    return componentNode;
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
  addComponentDescendant<ComponentType extends InbuiltComponentTypes>(
    nodeData: BackroadComponent<ComponentType, false>
  ) {
    // return new Promise<ComponentPropsMapping[ComponentType]['value']>(
    //   (resolve) => {
    // console.debug('Adding component descendent', nodeData);
    const castedNodeData = nodeData as GenericBackroadComponent;
    this.container.children.push(castedNodeData);
    this.backroadSession.setValueIfNotSet(
      nodeData.id,
      nodeData.args.defaultValue
    );
    // console.log(
    //   'set default value call done for component descendent',
    //   nodeData.id,
    //   'proceeding to requesting render'
    // );
    this.backroadSession.renderQueue.addToQueue(
      this.getRenderPayload(castedNodeData, this.backroadSession)
    );
    return this.backroadSession.valueOf<ComponentType>(nodeData.id);
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
      // allowing to pass children in case someone wants to make
      // columnsContainer and stuff (manual child creation)
      children: containerNodeData.children || [],
    };
    this.container.children.push(containerNode);
    // const socket = SocketManager.getSocket(this.backroadSession.sessionId);
    this.backroadSession.renderQueue.addToQueue(
      this.getRenderPayload(containerNode, this.backroadSession)
    );
    return new BackroadNodeManager(
      containerNode as BackroadContainer<ContainerType>,
      this.backroadSession
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

  button(props: BackroadComponentFormat<'button'>) {
    return this.addComponentDescendant(
      this.constructComponentObject(props, 'button')
    );
  }
  numberInput(props: BackroadComponentFormat<'number_input'>) {
    return this.addComponentDescendant(
      this.constructComponentObject(props, 'number_input')
    );
  }
  write(props: BackroadComponentFormat<'markdown'>) {
    return this.addComponentDescendant(
      this.constructComponentObject(props, 'markdown')
    );
  }
  line(props: BackroadComponentFormat<'line_chart'>) {
    return this.addComponentDescendant(
      this.constructComponentObject(props, 'line_chart')
    );
  }
  select(props: BackroadComponentFormat<'select'>) {
    return this.addComponentDescendant(
      this.constructComponentObject(props, 'select')
    );
  }
  image(props: BackroadComponentFormat<'image'>) {
    return this.addComponentDescendant(
      this.constructComponentObject(props, 'image')
    );
  }
  sidebar(props: BackroadContainerFormat<'sidebar'>) {
    return this.addContainerDescendant(
      this.constructContainerObject(props, 'sidebar')
    );
  }
  link(props: BackroadComponentFormat<'link'>) {
    return this.addComponentDescendant(
      this.constructComponentObject(props, 'link')
    );
  }
  page(props: BackroadContainerFormat<'page'>) {
    return this.backroadSession.rootNodeManager.addContainerDescendant(
      this.constructContainerObject(props, 'page')
    );
  }
  linkGroup(props: BackroadComponentFormat<'link_group'>) {
    return this.addComponentDescendant(
      this.constructComponentObject(props, 'link_group')
    );
  }
  stats(props: BackroadComponentFormat<'stats'>) {
    return this.addComponentDescendant(
      this.constructComponentObject(props, 'stats')
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
  multiselect(props: BackroadComponentFormat<'multiselect'>) {
    const val = this.addComponentDescendant(
      this.constructComponentObject(props, 'multiselect')
    );
    return val;
  }
  json(props: BackroadComponentFormat<'json'>) {
    return this.addComponentDescendant(
      this.constructComponentObject(props, 'json')
    );
  }
  title(props: BackroadComponentFormat<'title'>) {
    return this.addComponentDescendant(
      this.constructComponentObject(props, 'title')
    );
  }
}
