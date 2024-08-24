"use client";

import { resultType } from "@/app/(site)/(routes)/tasks2/db-queries";
import { ChangeEvent, useEffect, useState } from "react";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { cn } from "@/lib/utils";
import { Checkbox } from "../ui/checkbox";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Layers, Maximize, Maximize2, Minimize, Radar } from "lucide-react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { DeleteAlertDialog } from "../shared/DeleteAlertDialog";
import { EditTask } from "../tasks/EditTask";
import { PriorityLabels } from "@/types/types";
import { AddNew } from "../tasks/AddNew";

enum RenderMode {
  Categorical = "categorical",
  Collapsed = "collapsed",
}

type collapsedModeData = (resultType["0"]["tasks"][0] & {
  category: string;
  id: string;
})[];

// Define a custom hook for managing expanded tasks
const useExpandedTasks = () => {
  const [expandedTasks, setExpandedTasks] = useState<string[]>([]);

  // Function to add a new task to the list of expanded tasks
  const addTask = (newTask: string) => {
    console.log("expand button clicked");
    const res = expandedTasks.some((x) => x === newTask);
    if (!res) {
      console.log("not there");
      setExpandedTasks((prevTasks) => [...prevTasks, newTask]);
      return;
    }
    console.log("there");
    const newList = expandedTasks.filter((x) => x !== newTask);
    setExpandedTasks([...newList]);
    return;
  };
  const isExpandedTask = (task: string) => {
    return expandedTasks.includes(task);
  };

  // Optionally, you could include more functions here, like removing tasks

  return {
    expandedTasks,
    addTask,
    isExpandedTask,
  };
};

const useCollapsedModeData = (data: resultType) => {
  const [isCollapsed, setCollapsed] = useState<boolean>(false);
  const [collapsedModeData, setCollapsedModeData] = useState<collapsedModeData>(
    [],
  );

  useEffect(() => {
    const processedData = data
      .map((x) =>
        x.tasks.map((y) => ({ ...y, category: x.title, categoryId: x.id })),
      )
      .flat(1)
      .sort((a, b) => {
        if (a.viewAs === "Checkbox" && b.viewAs === "Status") {
          return -1;
        } else if (a.viewAs === "Status" && b.viewAs === "Checkbox") {
          return 1;
        } else {
          return Number(b.priority) - Number(a.priority);
        }
      });

    setCollapsedModeData(processedData);
    console.log("Collapsed data set");
  }, [data]);

  return {
    isCollapsed,
    setCollapsed,
    collapsedModeData,
  };
};

export const ScrollPreview = ({ data }: { data: resultType }) => {
  const { expandedTasks, addTask, isExpandedTask } = useExpandedTasks();
  const { isCollapsed, setCollapsed, collapsedModeData } =
    useCollapsedModeData(data);

  return (
    <div className="">
      <ViewSwitch
        collapsed={isCollapsed}
        handleClick={() => setCollapsed(!isCollapsed)}
      />
      <div className={" flex flex-col gap-2 p-4 pl-6"}>
        {!isCollapsed &&
          data.map((c) => (
            <div className="flex w-full flex-col" key={c.id}>
              {c.tasks.length !== 0 && (
                <>
                  <div className="flex flex-row justify-start align-middle">
                    <h2 className="text-xl font-semibold leading-8 tracking-normal">
                      {c.title}
                    </h2>
                  </div>
                  <div className="">
                    <PreviewItem
                      tasks={c.tasks}
                      handleExtendTaskClick={addTask}
                      isExpandedTask={isExpandedTask}
                    >
                      {/* <ExpandButton buttonLabel="See in new page" /> */}
                    </PreviewItem>
                  </div>
                </>
              )}
            </div>
          ))}
        {isCollapsed && collapsedModeData && (
          <div className="">
            <PreviewItemCollapsed
              tasks={collapsedModeData}
              handleExtendTaskClick={addTask}
              isExpandedTask={isExpandedTask}
            />
            {/* <ExpandButton buttonLabel="See in new page" /> */}
          </div>
        )}
        {isCollapsed && !collapsedModeData && <div>Nothing to show.</div>}
      </div>
    </div>
  );
};

const ViewSwitch = ({
  collapsed,
  handleClick,
}: {
  collapsed: boolean;
  handleClick: () => void;
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Switch id="mode" checked={collapsed} onClick={handleClick} />
      <Label htmlFor="mode">{collapsed ? "collapsed" : "categorical"}</Label>
    </div>
  );
};

export const PreviewItem = ({
  tasks,
  handleExtendTaskClick,
  isExpandedTask,
  // children,
}: {
  tasks: resultType[0]["tasks"];
  handleExtendTaskClick: (newTask: string) => void;
  isExpandedTask: (task: string) => boolean;
  // children: ReactNode;
}) => {
  return (
    <div className="flex w-full flex-col gap-0.5">
      {tasks.map((t) => (
        <div
          className={cn(
            "flex flex-col rounded-xl border border-transparent bg-gradient-to-r from-indigo-500 to-purple-500 p-1.5 pb-0 font-semibold leading-10 tracking-normal text-slate-100 transition",
            {
              "h-60": isExpandedTask(t.id),
            },
          )}
          key={t.id}
        >
          <div className="flex flex-row justify-between">
            <div className="flex items-baseline gap-4">
              <h1 className="text-xl tracking-wide">{t.title}</h1>
              <p className="text-sm tracking-widest">{t.description}</p>
              <p>view As: {t.viewAs.toString()}</p>
              <span>priority: {t.priority}</span>
            </div>
            <div className="flex gap-4">
              <span>locked: {t.locked?.valueOf()}</span>
              <span className="capitalize text-slate-300">{t.status}</span>
            </div>
          </div>
          <div className="flex flex-row items-baseline justify-start gap-4 align-middle leading-6">
            <div className="flex flex-row items-baseline justify-center gap-0.5 align-middle">
              <div className="inline-flex aspect-auto h-[5px] w-[5px] rounded bg-slate-300"></div>
              <span>expires on:{t.expiresOn?.toLocaleDateString()}</span>
            </div>
            <span>contains {t.subtasks.length} subtasks</span>
            <span>contains {t.trackersTasksMap.length} trackers.</span>
            <button
              className="inset-1 w-16 rounded-lg ring ring-white"
              onClick={() => handleExtendTaskClick(t.id)}
            >
              Expand
            </button>
          </div>

          {/* <button>Expand</button> */}
          {/* <Separator className="bg-sky-900" /> */}
        </div>
      ))}
    </div>
  );
};

export const PreviewItemCollapsed = ({
  tasks,
  handleExtendTaskClick,
  isExpandedTask,
  // children,
}: {
  tasks: collapsedModeData;
  handleExtendTaskClick: (newTask: string) => void;
  isExpandedTask: (task: string) => boolean;
  // children: ReactNode;
}) => {
  return (
    <div className="flex w-full flex-col gap-1">
      {tasks.map((t) => (
        <div key={t.id}>
          {t.viewAs === "Status" && (
            <StatusTaskRender
              t={t}
              handleExtendTaskClick={handleExtendTaskClick}
              isExpandedTask={isExpandedTask}
            />
          )}
          {t.viewAs === "Checkbox" && <RenderCheckBox t={t} />}
        </div>
      ))}
    </div>
  );
};


const useTaskDetailMinMaxView = () => {
  const [isMax, setMax] = useState<boolean>(false)
  return {
    isMax,
    setMax
  }
}

const StatusTaskRender = ({
  t,
  handleExtendTaskClick,
  isExpandedTask,
}: {
  t: collapsedModeData[0];
  handleExtendTaskClick: (newTask: string) => void;
  isExpandedTask: (task: string) => boolean;
}) => {
  const {isMax, setMax} = useTaskDetailMinMaxView()
  const isWideScreen = useMediaQuery("(min-width: 900px)");
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-xl border border-transparent bg-gradient-to-r from-indigo-500 to-purple-500 p-2 pt-0 font-semibold leading-10 tracking-normal text-slate-100 transition",
        {
          "max-h-80 min-h-40 overflow-y-scroll relative": isExpandedTask(t.id),
        },
      )}
    >
      <div className="flex flex-row items-start justify-between">
        <div className="flex flex-1 flex-wrap justify-between gap-2">
          <h1
            className={cn(
              "line-clamp-2 min-w-48 break-words text-xl font-bold capitalize",
              {
                "tracking-wide": isWideScreen,
              },
            )}
          >
            {t.title}
          </h1>
          <div>
            {!isWideScreen && (
              <span className="capitalize leading-4 text-slate-300">
                in {t.category}
              </span>
            )}
            {!isWideScreen && (
              <span className="capitalize leading-4 text-slate-300"> {t.status}</span>
            )}
          </div>
        </div>
        {isWideScreen && (
          <div className="flex gap-4">
            <span className="capitalize text-slate-300">in {t.category}</span>
            <span>locked: {t.locked?.valueOf()}</span>
            <span className="capitalize text-slate-300"> {t.status}</span>
          </div>
        )}
      </div>
      <div>
        <p className="truncate text-wrap pl-2 text-sm tracking-widest">
          {t.description}
        </p>
      </div>
      {!isWideScreen && !isExpandedTask(t.id) && (
          <div className="flex flex-col pl-4">
            <div>
              <p className="truncate text-wrap pl-2 text-xs tracking-widest">
                contains {t.subtasks.length} subtasks
              </p>
            </div>
            <div>
              <p className="truncate text-wrap pl-2 text-xs tracking-widest">
                contains {t.trackersTasksMap.length} trackers
              </p>
            </div>
          </div>
      )}
      {isWideScreen && !isExpandedTask(t.id) && (
          <div className="flex flex-row flex-wrap items-baseline justify-start gap-4 pl-2 align-middle leading-6">
            {isWideScreen && (
              <div className="flex flex-row items-baseline justify-center gap-0.5 align-middle">
                <div className="inline-flex aspect-auto h-[5px] w-[5px] rounded bg-slate-300"></div>
                <span> expires on:{t.expiresOn?.toLocaleDateString()}</span>
              </div>
            )}
            {/* <span>contains {t.subtasks.length} subtasks</span> */}
            <span className=" flex flex-row gap-2">
              {" "}
              {t.subtasks.length} <Layers />
            </span>
            <span className=" flex flex-row gap-2">
              {" "}
              {t.trackersTasksMap.length} <Radar />
            </span>
            <span className=" flex flex-row gap-2">
              {" "}
              <button>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  className="lucide lucide-ellipsis-vertical"
                >
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="12" cy="5" r="1" />
                  <circle cx="12" cy="19" r="1" />
                </svg>
              </button>
            </span>
          </div>
      )}
      

      {isExpandedTask(t.id) && (
        <div className="ml-2 pl-1 opacity-90 border-slate-400 border my-1 text-sm rounded-md">
          <div className="flex flex-row justify-between">
          <h2>View Task Details</h2>
          {isMax ? <Minimize onClick={() => setMax(!isMax)} /> : <Maximize onClick={() => setMax(!isMax)} /> }
          </div>
          {isMax && <TaskProperties t={t}/>}
        </div>
      )}
      {isExpandedTask(t.id) && (
        <div className="pl-1">
          <h2>Subtasks:</h2>
          <div>
            {t.subtasks.map(x => <div>{x.title}</div>)}
          </div>
          <AddNew subtask={{taskId: t.id}} />
        </div>
      )}
      {isExpandedTask(t.id) && <div className="h-8 w-8 text-gray-800 dark:text-neutral-500 dark:bg-neutral-800 opacity-70 bg-slate-300"><EditTask data={{
        id: t.id,
        title: t.title,
        viewAs: t.viewAs,
        description: t.description,
        priorityLabel: t.priorityLabel,
        remark: t.remark
      }} categoryName={t.id}/>
      </div>}
      {<button className="absolute right-2 bottom-2 z-99999999999" onClick={() => handleExtendTaskClick(t.id)}>
        <Maximize2 />
      </button>}

      {/* <button>Expand</button> */}
      {/* <Separator className="bg-sky-900" /> */}
    </div>
  );
};

const RenderCheckBox = ({ t }: { t: collapsedModeData[0] }) => {
  const [checked, setChecked] = useState<boolean>(false);
  return (
    <div>
      <div className="line-clamp-3 flex flex-row items-center justify-stretch space-x-2">
        <Checkbox
          id="terms"
          checked={checked}
          onClick={() => setChecked(!checked)}
        />
        <label
          htmlFor="terms"
          className={cn(
            "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            {
              "line-through": checked,
            },
          )}
        >
          {t.title}
        </label>
      </div>
    </div>
  );
};




const TaskProperties = ({t}: {t: resultType[0]['tasks'][0]}) => {
  return (
    <Table className="pb-0">
      <TableCaption className="text-white">Properties of Task</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="text-white">Property</TableHead>
          <TableHead className="text-white">Value</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="text-white">
        <TableRow>
          <TableCell>Title</TableCell>
          <TableCell>{t.title}</TableCell>
          </TableRow>
          <TableRow>
          <TableCell>Description</TableCell>
          
          <TableCell>{t.description}</TableCell>
          </TableRow>
          <TableRow>
          <TableCell>Created On:</TableCell>
          <TableCell>{t.createdOn?.toLocaleDateString()} {t.createdOn?.toLocaleTimeString()}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Locked</TableCell>
          <TableCell>{t.locked?.valueOf().toString()}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Status</TableCell>
          <TableCell>{t.status}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Expires On</TableCell>
          <TableCell>{t.expiresOn.toLocaleString()}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Priority Label</TableCell>
          <TableCell>{t.priorityLabel ?? "Not Given"}</TableCell>
        </TableRow>
        {t.remark && (<TableRow>
          <TableCell>Remark</TableCell>
          <TableCell>{t?.remark}</TableCell>
        </TableRow>)}
      </TableBody>
    </Table>
  )
}
