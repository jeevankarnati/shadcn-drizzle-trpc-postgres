"use client";

import { trpc } from "@/app/_trpc/client";
import { ServerTypes } from "@/app/_trpc/serverClient";
import { useClient } from "@/lib/useClient";
import { luxonDate } from "@/lib/utils";
import { DateTime } from "luxon";
import { useState } from "react";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";

type Props = {
  initialData: ServerTypes<"getAllUsers">;
};

const Users: React.FC<Props> = ({ initialData }) => {
  const getAllUsers = trpc.getAllUsers.useQuery(undefined, {
    initialData,
  });

  const [data, setData] = useState({
    name: "",
    age: "",
    isActive: false,
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const { isClient } = useClient();

  const utils = trpc.useUtils();

  const createUser = trpc.createUser.useMutation({
    onSettled: () => {
      setData({ name: "", age: "", isActive: false });
      utils.invalidate(undefined, { queryKey: ["getAllUsers"] });
      setIsOpen(false);
    },
  });

  const deleteUser = trpc.deleteUser.useMutation({
    onSettled: () => {
      utils.invalidate(undefined, { queryKey: ["getAllUsers"] });
    },
  });

  const updateUser = trpc.updateUser.useMutation({
    onSettled: () => {
      setData({ name: "", age: "", isActive: false });
      utils.invalidate(undefined, { queryKey: ["getAllUsers"] });
      setIsOpen(false);
      setEditId(null);
    },
  });

  const handleCreate = () => {
    createUser.mutate({
      ...data,
      age: Number(data.age),
      createdAt: DateTime.now().toISO(),
      updatedAt: DateTime.now().toISO(),
    });
  };

  const handleUpdate = () => {
    if (editId) {
      updateUser.mutate({
        ...data,
        id: editId,
        age: Number(data.age),
        updatedAt: DateTime.now().toISO(),
      });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Button
          onClick={() => {
            setIsOpen(true);
            setEditId(null);
          }}
        >
          Create User
        </Button>
        <ThemeSwitcher />
      </div>

      <Dialog open={isOpen} onOpenChange={(e) => setIsOpen(e)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editId ? "Update" : "Create"} User</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Enter a name"
                required
                value={data.name}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                placeholder="Enter an age"
                type="number"
                required
                value={data.age}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, age: e.target.value }))
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="active"
                checked={data.isActive}
                onClick={() =>
                  setData((prev) => ({ ...prev, isActive: !prev.isActive }))
                }
              />
              <Label htmlFor="active">is Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              color="danger"
              variant="ghost"
              onClick={() => setIsOpen(false)}
            >
              Close
            </Button>
            <Button
              disabled={data.name === "" || data.age === ""}
              onClick={() => {
                editId ? handleUpdate() : handleCreate();
              }}
              isLoading={editId ? updateUser.isPending : createUser.isPending}
            >
              {editId ? "Update" : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="rounded-md border">
        <Table aria-label="Example static collection table">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Updated At</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {getAllUsers.data && getAllUsers.data.length ? (
              getAllUsers.data.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.age}</TableCell>
                  <TableCell>
                    {user.isActive ? (
                      <div className="px-3 py-1 bg-green-500 w-fit rounded-full text-black">
                        Active
                      </div>
                    ) : (
                      <div className="px-3 py-1 bg-red-500 w-fit rounded-full text-white">
                        Inactive
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {isClient
                      ? luxonDate(user.createdAt).toFormat("ff")
                      : user.createdAt.split("T")[0]}
                  </TableCell>
                  <TableCell>
                    {isClient
                      ? luxonDate(user.updatedAt).toFormat("ff")
                      : user.updatedAt.split("T")[0]}
                  </TableCell>
                  <TableCell>
                    <div className="relative flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditId(user.id);
                          setData({
                            name: user.name,
                            age: String(user.age),
                            isActive: user.isActive,
                          });
                          setIsOpen(true);
                        }}
                        className="text-lg text-blue-500 cursor-pointer active:opacity-50"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => {
                          deleteUser.mutate({ id: user.id });
                        }}
                        className="bg-transparent border-none hover:bg-transparent text-lg text-red-500 cursor-pointer active:opacity-50"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <tr>
                <td colSpan={6}>
                  <div className="h-[200px] flex justify-center items-center">
                    Empty Data
                  </div>
                </td>
              </tr>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Users;
