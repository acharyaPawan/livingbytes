"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

export const DeleteAlertDialog = ({ type, handleDelete }: {  type: string, handleDelete: () => void }) => {

  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <Trash2 />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
          {`This action cannot be undone. This will permanently delete your ${type}
  and remove your task from our servers.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
          >
            Continue
          </AlertDialogAction>
          {/* <AlertDialogAction
            onClick={async (e) => {
              e.preventDefault;
              try {
                const { data, error } = await client.post.deleteTask.mutate({
                  taskId: id,
                });
                if (data) {
                  router.refresh();
                }
                if (error) {
                  throw new Error(`Server_Error_Delete:${error}`);
                }
              } catch (e: any) {
                throw new Error("Client_Error_Delete:", e);
              }
            }}
          >
            Continue
          </AlertDialogAction> */}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
