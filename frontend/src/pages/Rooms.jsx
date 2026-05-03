import { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/Data-table";
import { Plus, Building, Users, Edit, X, Clock } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

const roomTypes = [
  { value: "lecture_hall", label: "Lecture Hall" },
  { value: "lab", label: "Laboratory" },
  { value: "seminar_room", label: "Seminar Room" },
  { value: "auditorium", label: "Auditorium" },
];
const weekDays = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];
const emptyAvail = {
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: [],
  sunday: [],
};

const inputCls =
  "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-violet-400 dark:focus:border-violet-500";
const labelCls = "text-sm font-medium text-slate-700 dark:text-slate-300";

export default function RoomPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const { canManageRooms } = useAuth();
  const { roleTheme } = useTheme();
  const [formData, setFormData] = useState({
    name: "",
    building: "",
    floor: "",
    capacity: "",
    type: "",
    equipment: "",
    availability: emptyAvail,
  });
  const [newSlot, setNewSlot] = useState({ day: "monday", start: "", end: "" });

  const resetForm = () => {
    setFormData({
      name: "",
      building: "",
      floor: "",
      capacity: "",
      type: "",
      equipment: "",
      availability: emptyAvail,
    });
    setEditingRoom(null);
  };

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/rooms");
      setRooms(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleEdit = (room) => {
    setFormData({
      name: room.name || "",
      building: room.building || "",
      floor: room.floor?.toString() || "",
      capacity: room.capacity?.toString() || "",
      type: room.type || "",
      equipment: room.equipment?.join(", ") || "",
      availability: room.availability || emptyAvail,
    });
    setEditingRoom(room);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = {
        ...formData,
        capacity: Number(formData.capacity),
        floor: Number(formData.floor),
        equipment: formData.equipment
          ? formData.equipment
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
      };
      if (editingRoom)
        await axios.put(
          `http://localhost:5000/api/rooms/${editingRoom._id}`,
          payload,
        );
      else await axios.post("http://localhost:5000/api/rooms", payload);
      resetForm();
      setShowForm(false);
      fetchRooms();
    } catch (e) {
      console.error(e);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this room?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/rooms/${id}`);
      if (editingRoom?._id === id) {
        resetForm();
        setShowForm(false);
      }
      fetchRooms();
    } catch (e) {
      console.error(e);
    }
  };

  const addSlot = () => {
    if (!newSlot.start || !newSlot.end) return;
    setFormData((p) => ({
      ...p,
      availability: {
        ...p.availability,
        [newSlot.day]: [
          ...p.availability[newSlot.day],
          { start: newSlot.start, end: newSlot.end },
        ],
      },
    }));
    setNewSlot({ day: newSlot.day, start: "", end: "" });
  };

  const removeSlot = (day, i) =>
    setFormData((p) => ({
      ...p,
      availability: {
        ...p.availability,
        [day]: p.availability[day].filter((_, idx) => idx !== i),
      },
    }));

  const columns = [
    {
      key: "name",
      label: "Room",
      render: (r) => (
        <div>
          <div className="font-medium text-slate-800 dark:text-slate-100">
            {r.name}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {r.building}, Floor {r.floor}
          </div>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (r) => (
        <Badge className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700 text-xs">
          {r.type?.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
        </Badge>
      ),
    },
    {
      key: "capacity",
      label: "Capacity",
      render: (r) => (
        <div className="flex items-center gap-1 text-slate-700 dark:text-slate-200">
          <Users className="h-3 w-3 text-violet-500 dark:text-violet-400" />
          {r.capacity}
        </div>
      ),
    },
    {
      key: "equipment",
      label: "Equipment",
      render: (r) => (
        <div className="flex flex-wrap gap-1">
          {r.equipment?.slice(0, 2).map((eq, i) => (
            <Badge
              key={i}
              className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700 text-xs"
            >
              {eq}
            </Badge>
          ))}
          {r.equipment?.length > 2 && (
            <Badge className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 text-xs">
              +{r.equipment.length - 2}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <div className="flex gap-2">
          {canManageRooms() && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/30 h-8 px-3 text-xs"
                onClick={() => handleEdit(r)}
              >
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 h-8 px-3 text-xs"
                onClick={() => handleDelete(r._id)}
              >
                Delete
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Rooms
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage classrooms, labs, and other facilities.
            </p>
          </div>
          {canManageRooms() && (
          <Button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="text-white shadow-sm h-9 px-4 text-sm border-0"
            style={{ backgroundColor: roleTheme?.primary }}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Room
          </Button>
          )}
        </div>

        {showForm && (
          <Card className="bg-white dark:bg-slate-900 border-violet-100 dark:border-slate-700 shadow-sm">
            <CardHeader className="border-b border-violet-50 dark:border-slate-700/60 pb-4">
              <CardTitle className="text-slate-900 dark:text-white text-base">
                {editingRoom ? "Edit Room" : "Add New Room"}
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                Fill in the room details and set availability
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className={labelCls}>Room Name *</Label>
                    <Input
                      className={`mt-1 ${inputCls}`}
                      placeholder="e.g., Room A101"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label className={labelCls}>Building *</Label>
                    <Input
                      className={`mt-1 ${inputCls}`}
                      placeholder="e.g., Main Building"
                      value={formData.building}
                      onChange={(e) =>
                        setFormData({ ...formData, building: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className={labelCls}>Floor *</Label>
                    <Input
                      className={`mt-1 ${inputCls}`}
                      type="number"
                      min="0"
                      value={formData.floor}
                      onChange={(e) =>
                        setFormData({ ...formData, floor: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label className={labelCls}>Capacity *</Label>
                    <Input
                      className={`mt-1 ${inputCls}`}
                      type="number"
                      min="1"
                      value={formData.capacity}
                      onChange={(e) =>
                        setFormData({ ...formData, capacity: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label className={labelCls}>Room Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(v) =>
                        setFormData({ ...formData, type: v })
                      }
                    >
                      <SelectTrigger className={`mt-1 ${inputCls}`}>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100">
                        {roomTypes.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className={labelCls}>
                    Equipment (comma separated)
                  </Label>
                  <Textarea
                    className={`mt-1 ${inputCls}`}
                    placeholder="e.g., Projector, Whiteboard"
                    rows={2}
                    value={formData.equipment}
                    onChange={(e) =>
                      setFormData({ ...formData, equipment: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label className={`${labelCls} block mb-2`}>
                    Availability Schedule
                  </Label>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 mb-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
                      <div>
                        <Label className="text-xs text-slate-600 dark:text-slate-400">
                          Day
                        </Label>
                        <Select
                          value={newSlot.day}
                          onValueChange={(v) =>
                            setNewSlot({ ...newSlot, day: v })
                          }
                        >
                          <SelectTrigger className={`mt-1 text-sm ${inputCls}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100">
                            {weekDays.map((d) => (
                              <SelectItem
                                key={d}
                                value={d}
                                className="capitalize"
                              >
                                {d}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-slate-600 dark:text-slate-400">
                          Start
                        </Label>
                        <Input
                          type="time"
                          className={`mt-1 text-sm ${inputCls}`}
                          value={newSlot.start}
                          onChange={(e) =>
                            setNewSlot({ ...newSlot, start: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-slate-600 dark:text-slate-400">
                          End
                        </Label>
                        <Input
                          type="time"
                          className={`mt-1 text-sm ${inputCls}`}
                          value={newSlot.end}
                          onChange={(e) =>
                            setNewSlot({ ...newSlot, end: e.target.value })
                          }
                        />
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        onClick={addSlot}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white h-9"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {weekDays.map(
                      (day) =>
                        formData.availability[day]?.length > 0 && (
                          <div
                            key={day}
                            className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 bg-white dark:bg-slate-800/50"
                          >
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">
                              {day}
                            </span>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {formData.availability[day].map((slot, i) => (
                                <div
                                  key={i}
                                  className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded px-2 py-1"
                                >
                                  <Clock className="h-3 w-3 text-blue-500 dark:text-blue-400" />
                                  <span className="text-xs text-blue-700 dark:text-blue-300">
                                    {slot.start} - {slot.end}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => removeSlot(day, i)}
                                    className="text-red-400 hover:text-red-600 ml-1"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ),
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={formLoading}
                    className="text-white h-9 px-5 border-0"
                    style={{ backgroundColor: roleTheme?.primary }}
                  >
                    {formLoading
                      ? "Saving..."
                      : editingRoom
                        ? "Update Room"
                        : "Save Room"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetForm();
                      setShowForm(false);
                    }}
                    className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 h-9 px-5"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card className="bg-white dark:bg-slate-900 border-violet-100 dark:border-slate-700 shadow-sm">
          <CardHeader className="border-b border-violet-50 dark:border-slate-700/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: roleTheme?.primaryMid }}>
                <Building className="h-4 w-4" style={{ color: roleTheme?.primary }} />
              </div>
              <div>
                <CardTitle className="text-slate-900 dark:text-white text-base">
                  All Rooms
                </CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400">
                  {rooms.length} rooms available
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              data={rooms}
              columns={columns}
              searchKey="name"
              loading={loading}
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
