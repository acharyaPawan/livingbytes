import { Category } from "@/types/types";
import { create } from "zustand";
export type ModalType = "Edit Task" | "Edit Category";

// interface ModalData {
//     server?: Server;
//     channel?: Channel;
//     channelType?: ChannelType;
//     apiUrl?: string;
//     query?: Record<string, any>;
// }

// interface ModalStore {
//     type: ModalType | null;
//     data: ModalData;
//     isOpen: boolean;
//     onOpen: (type: ModalType, data?:ModalData) => void;
//     onClose: () => void;
// }


interface ModalStore {
    categorizedTasks: Category[] | [];
    trackers: null;
    blogs: null;
    setCategorizedTasks: (data: Category[] | []) => void
}


export const  useDataStore = create<ModalStore>((set) => ({
    categorizedTasks: [],
    trackers: null,
    blogs: null,
    setCategorizedTasks: (data) => set({
        categorizedTasks: data
    }),
}))

// export const useModal = create<ModalStore>((set) => ({
//     type: null,
//     data: {},
//     isOpen: false,
//     onOpen: (type, data = {}) => set({
//         isOpen: true,
//         type,
//         data
//     }),
//     onClose: () => set({
//         type: null,
//         isOpen: false
//     })
// }))
