
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

export function CourseForm({ initialData = null, onSubmit, loading }) {
  const defaultData = {
    code: "",
    name: "",
    department: "",
    credits: 3,
    semester: 1,
    year: new Date().getFullYear(),
    description: "",
    prerequisites: [],
    type: "lecture",
    hoursPerWeek: 3,
  };

  const [formData, setFormData] = useState(defaultData);
  const [prerequisiteInput, setPrerequisiteInput] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        code: initialData.code || "",
        name: initialData.name || "",
        department: initialData.department || "",
        credits: initialData.credits ?? 3,
        semester: initialData.semester ?? 1,
        year: initialData.year ?? new Date().getFullYear(),
        description: initialData.description || "",
        prerequisites: initialData.prerequisites || [],
        type: initialData.type || "lecture",
        hoursPerWeek: initialData.hoursPerWeek ?? 3,
      });
    } else {
      setFormData(defaultData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "credits" ||
        name === "semester" ||
        name === "year" ||
        name === "hoursPerWeek"
          ? Number(value)
          : value,
    }));
  };

  const addPrerequisite = () => {
    if (
      prerequisiteInput.trim() &&
      !formData.prerequisites.includes(prerequisiteInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        prerequisites: [...prev.prerequisites, prerequisiteInput.trim()],
      }));
      setPrerequisiteInput("");
    }
  };

  const removePrerequisite = (prerequisite) => {
    setFormData((prev) => ({
      ...prev,
      prerequisites: prev.prerequisites.filter((p) => p !== prerequisite),
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addPrerequisite();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const inputClass =
    "w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all duration-200";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Course Code */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">
            Course Code *
          </label>
          <Input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleChange}
            placeholder="e.g., CS101"
            required
            className={inputClass}
          />
        </div>

        {/* Department */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">
            Department *
          </label>
          <Input
            type="text"
            name="department"
            value={formData.department}
            onChange={handleChange}
            placeholder="e.g., Computer Science"
            required
            className={inputClass}
          />
        </div>
      </div>

      {/* Course Name */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700">
          Course Name *
        </label>
        <Input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Introduction to Programming"
          required
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {/* Credits */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">
            Credits *
          </label>
          <Input
            type="number"
            name="credits"
            value={formData.credits}
            onChange={handleChange}
            required
            min="1"
            max="10"
            className={inputClass}
          />
        </div>

        {/* Semester */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">
            Semester *
          </label>
          <Input
            type="number"
            name="semester"
            value={formData.semester}
            onChange={handleChange}
            required
            min="1"
            max="8"
            className={inputClass}
          />
        </div>

        {/* Academic Year */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">
            Academic Year *
          </label>
          <Input
            type="number"
            name="year"
            value={formData.year}
            onChange={handleChange}
            required
            min="2020"
            max="2030"
            className={inputClass}
          />
        </div>

        {/* Hours per week */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">
            Hours / Week *
          </label>
          <Input
            type="number"
            name="hoursPerWeek"
            value={formData.hoursPerWeek}
            onChange={handleChange}
            required
            min="1"
            max="40"
            className={inputClass}
          />
        </div>
      </div>

      {/* Type */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700">
          Type *
        </label>
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
          className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all duration-200 appearance-none cursor-pointer"
        >
          <option value="lecture">Lecture</option>
          <option value="lab">Lab</option>
          <option value="tutorial">Seminar</option>
        </select>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700">
          Description
        </label>
        <Textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter course description..."
          rows={3}
          className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all duration-200 resize-none"
        />
      </div>

      {/* Prerequisites */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          Prerequisites
        </label>
        <div className="flex gap-2">
          <Input
            type="text"
            value={prerequisiteInput}
            onChange={(e) => setPrerequisiteInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter prerequisite course code"
            className={inputClass}
          />
          <Button
            type="button"
            variant="outline"
            onClick={addPrerequisite}
            className="border-slate-200 text-slate-700 hover:bg-violet-50 hover:border-violet-300 px-5"
          >
            Add
          </Button>
        </div>
        {formData.prerequisites.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {formData.prerequisites.map((prerequisite, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="flex items-center gap-1.5 px-3 py-1 bg-violet-50 border border-violet-200 text-violet-700 rounded-lg"
              >
                {prerequisite}
                <button
                  type="button"
                  onClick={() => removePrerequisite(prerequisite)}
                  className="hover:text-red-500 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          disabled={loading}
          className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-2.5 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </div>
          ) : initialData ? (
            "Update Course"
          ) : (
            "Add Course"
          )}
        </Button>
      </div>
    </form>
  );
}