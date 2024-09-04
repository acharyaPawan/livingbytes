"use client";

import { resultType } from "@/app/(site)/(routes)/tasks2/db-queries";
import { ChangeEvent, useEffect, useState, useTransition } from "react";
import { Switch } from "../ui/switch";
import { cn } from "@/lib/utils";
import { Checkbox } from "../ui/checkbox";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  FilePlus,
  Layers,
  Maximize,
  Maximize2,
  Minimize,
  Radar,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { DeleteAlertDialog } from "../shared/DeleteAlertDialog";
import { EditTask } from "../tasks/EditTask";
import { PriorityLabels, TaskStatus, TaskType } from "@/types/types";
import { AddNew } from "../tasks/AddNew";
import { subtasks } from "drizzle/schema";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FormError, FormSuccess, MyTimer, PopOverForUI, ThreeDotsVertical } from "./ui";
import { Separator } from "../ui/separator";
import { deleteFunctionality, updateStatus } from "@/app/actions";
import { revalidateTagsAction } from "@/actions/utils";
import { getErrorMessage } from "@/utils/misc";
import { status } from "@/server/db/schema";
import { ClassNameValue } from "tailwind-merge";

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
  const [isCollapsed, setCollapsed] = useState<boolean>(true);
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
    <div>
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
              <span>expires on:{(new Date(t.expiresOn)).toLocaleDateString()}</span>
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
    <div className="flex w-full flex-col gap-2">
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

const useTaskDetailMinMaxView = (isWideScreen: boolean) => {
  const [isMaxTaskDetails, setMaxTaskDetails] = useState<boolean>(false);
  const [isMaxSubtaskDetails, setMaxSubtaskDetails] = useState<boolean>(true);

  return {
    viewControl: {
      tasks: {
        isMax: isMaxTaskDetails,
        setMax: setMaxTaskDetails,
      },
      subtasks: {
        isMax: isMaxSubtaskDetails,
        setMax: setMaxSubtaskDetails,
      },
    },
  };
};

const StatusTaskRender = ({
  t,
  handleExtendTaskClick,
  isExpandedTask,
}: {
  t: collapsedModeData[0];
  handleExtendTaskClick: (newTask: string) => void;
  isExpandedTask: (task: string) => boolean;
}) => {
  const isWideScreen = useMediaQuery("(min-width: 900px)");
  const { viewControl } = useTaskDetailMinMaxView(isWideScreen);
  const trackers = t.trackersTasksMap.map((x) => x.tracker);

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-xl border border-transparent bg-accent  p-2 pt-0 font-semibold leading-10 tracking-normal  transition",
        {
          "relative max-h-80 min-h-40 overflow-y-scroll": isExpandedTask(t.id),
        },
      )}
    >
      <OptionsPopover t={t} type="tasks" buttonClassName={"absolute right-2 top-2 z-50 max-w-fit cursor-pointer"} />
      {/* <Popover>
        <PopoverTrigger asChild>
          <button className="absolute right-2 top-2 z-50 max-w-fit cursor-pointer">
            <ThreeDotsVertical />
          </button>
        </PopoverTrigger>
        <PopoverContent>
          <div>
            <Command>
              <CommandList>
                <CommandGroup>
                  <CommandItem>
                    <Popover>
                      <PopoverTrigger asChild>
                        <span>View Details</span>
                      </PopoverTrigger>
                      <PopoverContent>
                        <TaskOrSubtaskProperties t={t} />
                      </PopoverContent>
                    </Popover>
                  </CommandItem>
                  <CommandItem>
                    <span>Lock Task</span>
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        </PopoverContent>
      </Popover> */}
      <div className="relative mr-6 flex flex-row items-start justify-between">
        <div className=" flex flex-1 flex-wrap justify-between gap-2">
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
          <div className="flex flex-row gap-2">
            {!isWideScreen && (
              <span className="capitalize ">
                in {t.category}
              </span>
            )}
            {!isWideScreen && (
              <span className="capitalize ">
                {t.status}
              </span>
            )}
            {!isWideScreen && t.priorityLabel && (
              <span className="capitalize  italic">
                {t.priorityLabel}
              </span>
            )}
          </div>
        </div>
        {isWideScreen && (
          <div className="flex gap-4">
            {(["In Progress", "Paused"].includes(t.status)) && <MyTimer expiryTimestamp={new Date(t.expiresOn)} tid={t.id} type={"tasks"} currStatus={t.status} />}
            {(["Scheduled"].includes(t.status)) && <MyTimer expiryTimestamp={new Date(t.effectiveOn)} tid={t.id} type={"tasks"} currStatus={t.status} effectiveTimestamp={new Date(t.effectiveOn)} />}
            
            <span className="capitalize ">in {t.category}</span>
            <span>locked: {t.locked?.valueOf().toString()}</span>
            <span className="capitalize"> {t.status}</span>
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
              <div className="inline-flex aspect-auto h-[5px] w-[5px] rounded"></div>
              <span> expires on:{(new Date(t.expiresOn)).toLocaleDateString()}</span>
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
              <ThreeDotsVertical />
            </button>
          </span>
        </div>
      )}

      {isExpandedTask(t.id) && (
        <div className="my-1 pl-2 text-sm">
          <div className="flex flex-row justify-between">
            <h2 className="text-xl tracking-tighter font-poppins">Subtasks</h2>
            <div className="flex align-baseline">
              <FilePlus />
              {viewControl.subtasks.isMax ? (
                <Minimize
                  onClick={() =>
                    viewControl.subtasks.setMax(!viewControl.subtasks.isMax)
                  }
                />
              ) : (
                <Maximize
                  onClick={() =>
                    viewControl.subtasks.setMax(!viewControl.subtasks.isMax)
                  }
                />
              )}
            </div>
          </div>
          {viewControl.subtasks.isMax && (
            <div className="pl-4">
              <div>
                {!isWideScreen &&
                  t.subtasks.map((x) => (
                    <>
                    <div className="flex gap-4 leading-8">
                      <div className="bold tracking-widest">{x.title} </div>
                      <span className="uppercase opacity-70">{x.status}</span>
                      {x.priorityLabel && <span className="italic opacity-70">{x.priorityLabel}</span>}
                      <OptionsPopover type="subtasks" t={x} />
                    </div>
                    <Separator className="mb-1" />
                    </>
                  ))}
                {isWideScreen && <PreviewSubtasks st={t.subtasks} />}
              </div>
              <AddNew subtask={{ taskId: t.id }} />
              {/* <OptionsPopverView type={"Subtask"} /> */}
            </div>
          )}
        </div>
      )}
      {isExpandedTask(t.id) && (
        <div>
          <div className="my-1 pl-2 text-sm">
            <div className="text-xl tracking-tighter font-poppins">Trackers</div>
            {trackers?.length === 0 && "No trackers"}
            {trackers?.length !== 0 &&
              trackers.map((x) => <div>{x?.title}</div>)}
          </div>
        </div>
      )}
      {/* {isExpandedTask(t.id) && (
        <div className="pl-1">
          <h2>Subtasks:</h2>
          <div>
            {t.subtasks.map(x => <div>{x.title}</div>)}
          </div>
          <AddNew subtask={{taskId: t.id}} />
        </div>
      )} */}
      {isExpandedTask(t.id) && (
        <div className="h-8 w-8 bg-slate-300 text-gray-800 opacity-70 dark:bg-neutral-800 dark:text-neutral-500">
          <EditTask
            data={{
              id: t.id,
              title: t.title,
              viewAs: t.viewAs,
              description: t.description,
              priorityLabel: t.priorityLabel,
              remark: t.remark,
              status: t.status,
              locked: t?.locked ?? false,
            }}
            categoryName={t.category}
          />
        </div>
      )}
      {
        <button
          className="z-99999999999 absolute bottom-2 right-2"
          onClick={() => handleExtendTaskClick(t.id)}
        >
          <Maximize2 />
        </button>
      }

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

const TaskProperties = ({ t }: { t: resultType[0]["tasks"][0] }) => {
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
          <TableCell>
            {t.effectiveOn?.toLocaleDateString()}{" "}
            {t.effectiveOn?.toLocaleTimeString()}
          </TableCell>
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
        {t.remark && (
          <TableRow>
            <TableCell>Remark</TableCell>
            <TableCell>{t?.remark}</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

interface SubtaskPopverProps {
  type: TaskType;
  t: resultType[0]["tasks"][0] | resultType[0]["tasks"][0]["subtasks"][0];
  buttonClassName?: string;
}

const OptionsPopverView = ({ type, t }: SubtaskPopverProps) => {
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState<string>()
  const [error, setError] = useState<string>()
  const handleLockClick = async (changeState: TaskStatus) => {
    console.log("Sending req to backend.")
    if (t.status === changeState) {
      setError("Already .")
      setInterval(() => {
        setError("")
      }, 3000);
    }
    await updateStatus(t.id, changeState, type).then(
      (message) => {
        if (message?.success) {
          setSuccess(message.success)
          setInterval(() => {
            setSuccess("")
          }, 3000);
        }
        if (message?.error) {
          setError(message.error)
          setInterval(() => {
            setError("")
          }, 3000);
        }
      }
    ).catch((e) => {
      setError("Error encountered.".concat(getErrorMessage(e)))
      setInterval(() => {
        setError("")
      }, 3000);
    })
  }

  const handleDeleteClick = async () => {
    console.log("Sending req to backend.")
    await deleteFunctionality(t.id, type).then(
      (message) => {
        if (message?.success) {
          setSuccess(message.success)
          setInterval(() => {
            setSuccess("")
          }, 3000);
        }
        if (message?.error) {
          setError(message.error)
          setInterval(() => {
            setError("")
          }, 3000);
        }
      }
    ).catch((e) => {
      setError("Error encountered.".concat(getErrorMessage(e)))
      setInterval(() => {
        setError("")
      }, 3000);
    })
  }
  return (
    <Command className="rounded-lg shadow-md md:min-w-[450px]">
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>
        {success && <FormSuccess message={success} />}
        {error && <FormError message={error} />}
        </CommandEmpty>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Options">
          <CommandItem>
            <User className="mr-2 h-4 w-4" />
            <DetailsPopover type={type} t={t} />
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem>
            {/* <Select
            <CreditCard className="mr-2 h-4 w-4" />
            <button onClick={() => handleLockClick("In Progress")}>Change Status of  {type === "tasks" ? "task" : "subtask"}</button> */}
            <Select onValueChange={async (value: TaskStatus) => await handleLockClick(value)}>
  <SelectTrigger className="w-full outline-none">
    <SelectValue placeholder="Status" />
  </SelectTrigger>
  <SelectContent>
    {status.enumValues.map((status) => (
      <SelectItem key={status}  value={status} disabled={status==="Scheduled"} className="flex flex-row justify-between"><span>{status}</span> </SelectItem>
    ))}
    {/* <SelectItem value="light">Light</SelectItem>
    <SelectItem value="dark">Dark</SelectItem>
    <SelectItem value="system">System</SelectItem> */}
  </SelectContent>
</Select>

          <CommandShortcut>⌘B</CommandShortcut>
          </CommandItem>
          <CommandGroup heading={"Actions"}>
            <CommandItem>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>
                Mark it Completed {type === "tasks" ? "task" : "subtask"}
              </span>
              <CommandShortcut>⌘B</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <CreditCard className="mr-2 h-4 w-4" />
              <button onClick={async () => await handleDeleteClick()}>
                Delete {type === "tasks" ? "task" : "subtask"}
              </button>
              <CommandShortcut>⌘B</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          {/* <CommandItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem> */}
        </CommandGroup>
      </CommandList>
    </Command>
  )
};

const OptionsPopover = ({ type, t, buttonClassName }: SubtaskPopverProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className={buttonClassName}>
          <ThreeDotsVertical />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-full" side="top">
        <OptionsPopverView type={type} t={t} />
      </PopoverContent>
    </Popover>
  );
};

const DetailsPopover = ({ type, t }: SubtaskPopverProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button>View Details</button>
      </PopoverTrigger>
      <PopoverContent className="w-80" side={"right"}>
        {<TaskOrSubtaskProperties t={t} />}
      </PopoverContent>
    </Popover>
  );
};

type TaskOrSubtask =
  | resultType[0]["tasks"][0]
  | resultType[0]["tasks"][0]["subtasks"][0];

const TaskOrSubtaskProperties = ({ t }: { t: TaskOrSubtask }) => {
  return (
    <div>
    <Table className="pb-0">
      <TableCaption className="">Properties of Task</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="">Property</TableHead>
          <TableHead className="">Value</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="">
        <TableRow>
          <TableCell>Title</TableCell>
          <TableCell>{t.title}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Description</TableCell>

          <TableCell>{t.description}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Effective(Created generally but scheduled date for scheduled ones.) On:</TableCell>
          <TableCell>
            {(new Date(t?.effectiveOn))?.toLocaleDateString() ?? "NG"}{" "}
            {(new Date(t?.effectiveOn))?.toLocaleTimeString() ?? "NG"}
          </TableCell>
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
          {!!t.expiresOn && <TableCell>
            {(new Date(t?.expiresOn))?.toLocaleDateString() ?? "NG"}{" "}
            {(new Date(t?.expiresOn))?.toLocaleTimeString() ?? "NG"}
          </TableCell>}
          {!!!t.expiresOn && <TableCell>
            "NG"
          </TableCell>}
        </TableRow>
        <TableRow>
          <TableCell>Priority Label</TableCell>
          <TableCell>{t.priorityLabel ?? "Not Given"}</TableCell>
        </TableRow>
        {t.remark && (
          <TableRow>
            <TableCell>Remark</TableCell>
            <TableCell>{t?.remark}</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
    </div>
  );
};

export const PreviewSubtasks = ({
  st,
}: {
  st: resultType[0]["tasks"][0]["subtasks"];
}) => {
  return (
    <div className="rounded-md border border-slate-500 px-1">
      {st.map((st) => {
        return (
          <div className="div flex flex-row justify-between align-baseline" key={st.id}>
            <div className="flex gap-2 flex-wrap break-words align-baseline">
              <h2 className="text-md tracking-widest bold">{st.title}</h2>
              {st.description && <span className="opacity-80">{st.description}</span>}
              <span className="italic opacity-70">{st.remark}</span>
              {st.priorityLabel && <span className="opacity-90 font-serif">{st.priorityLabel}</span>}
              
            </div>
            <div className="flex gap-2 opacity-70 flex-wrap break-words">
              <span>Category: {st?.category.title}</span>
              <span>Locked:{st.locked?.valueOf().toString()}</span>
              <span>{st.priorityLabel}</span>
              <span className="bold font-mono opacity-95 text-primary">Status: {st.status}</span>
              <OptionsPopover type="subtasks" t={st} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
