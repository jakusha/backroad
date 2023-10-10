import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { TreeRender } from "../tree";
import { BackroadContainerRenderer } from "../types/containers";

import {
    Accordion as ReactAccordion,
    AccordionItem,
    AccordionItemHeading,
    AccordionItemButton,
    AccordionItemPanel,
    AccordionItemState
} from 'react-accessible-accordion';
export const Collapse: BackroadContainerRenderer<"collapse"> = (props) => {
    return <ReactAccordion allowZeroExpanded >
        <AccordionItem className="border border-base-300 p-4 rounded-lg">


            <AccordionItemHeading className="">
                <AccordionItemButton>
                    <AccordionItemState >
                        {({ expanded }) => <div className="flex justify-between items-center">
                            <div className="flex-1">

                                {props.args.label}
                            </div>
                            {expanded ? <ChevronUpIcon width={20} /> : <ChevronDownIcon width={20} />}
                        </div>

                        }
                    </AccordionItemState>
                </AccordionItemButton>
            </AccordionItemHeading>
            <AccordionItemPanel className="mt-4">
                {props.children.map(child => <TreeRender tree={child} key={child.path} />)}
            </AccordionItemPanel>
        </AccordionItem>
    </ReactAccordion>
}