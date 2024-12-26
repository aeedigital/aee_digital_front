"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

interface FormInputType {
  type?: string;
  name: string;
  value: any;
  onChange: (name: string, value: any) => void;
  options?: string[];
  isDisabled?: boolean;
  isRequired?: boolean;
  answerType?: string;
}

const FormInput: React.FC<FormInputType> = ({
  type,
  name,
  value: initialValue,
  onChange,
  options = [],
  isDisabled = false,
  isRequired = false,
  answerType,
}) => {
  const [value, setValue] = useState(initialValue);

  const [isEmpty, setIsEmpty] = useState(isRequired && !initialValue);

  const isValidDate = (date: any) => date instanceof Date;

  useEffect(() => {
    setValue(initialValue);
    setIsEmpty(isRequired && !initialValue);
  }, [initialValue, isRequired]);

  const handleBlur = () => {
    onChange(name, value); // Dispara a alteração ao perder o foco
  };

  const handleChange = (newValue: any) => {
    console.log("HANDLE CHANCE", name, answerType)
    setValue(newValue); // Apenas atualiza o estado local
    setIsEmpty(isRequired && !newValue);

    const inputType = getInputType();
    if (["checkbox", "radio", "switch", "select", "date", "time"].includes(inputType || "")) {
      // Para esses tipos, chama diretamente a API ao mudar
      console.log("ENTROU")
      onChange(name, newValue);
    }
  };

  const getInputType = () => {
    switch (answerType) {
      case "Option":
        return "select";
      case "String":
        return "text";
      case "LongText":
        return "textarea";
      case "Boolean":
        return "checkbox";
      case "Radio":
        return "radio";
      case "Switch":
        return "switch";
      case "Date":
        return "date";
      case "Time":
        return "time";
      default:
        return type || "text";
    }
  };

  const inputType = getInputType();
  const inputStyles = isEmpty ? { borderColor: "red", borderWidth: "1px" } : {};

  return (
    <div className="space-y-2">
      {inputType === "select" && (
        <Select
          value={value}
          onValueChange={(newValue) => handleChange(newValue)}
          disabled={isDisabled}
        >
          <SelectTrigger style={inputStyles}>
            <SelectValue placeholder="Selecione uma opção" />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {inputType === "textarea" && (
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)} // Atualiza localmente ao digitar
          onBlur={handleBlur} // Chama a API ao perder o foco
          placeholder="Digite algo..."
          disabled={isDisabled}
          style={inputStyles}
        />
      )}

      {inputType === "checkbox" && (
        <Checkbox
          checked={value === true || value === "true"} // Suporte a string "true"
          onCheckedChange={(checked) => handleChange(checked)} // Chama direto a API ao mudar
          disabled={isDisabled}
        />
      )}

      {inputType === "radio" && (
        <RadioGroup
          value={value}
          onValueChange={(val) => handleChange(val)}
          disabled={isDisabled}
        >
          {options.map((option) => (
            <RadioGroupItem key={option} value={option}>
              {option}
            </RadioGroupItem>
          ))}
        </RadioGroup>
      )}

      {inputType === "switch" && (
        <Switch
          checked={value === true || value === "true"} // Suporte a string "true"
          onCheckedChange={(checked) => handleChange(checked)} // Chama direto a API ao mudar
          disabled={isDisabled}
        />
      )}

{inputType === "date" && (
  <Popover>
    <PopoverTrigger asChild>
      <Input
        type="text"
        value={value && isValidDate(new Date(value)) ? format(new Date(value), "dd/MM/yyyy") : ""}
        placeholder="Selecione uma data"
        readOnly
        disabled={isDisabled}
        style={inputStyles}
      />
    </PopoverTrigger>
    <PopoverContent className="p-0">
      <Calendar
        selected={isValidDate(new Date(value)) ? new Date(value) : undefined}
        onSelect={(date) => {
          if (date) {
            handleChange(date); // Atualiza o estado local com a data selecionada
            onChange(name, date); // Notifica o componente pai
          }
        }}
        mode="single" // Permite selecionar apenas uma data
        disabled={isDisabled}
      />
    </PopoverContent>
  </Popover>
)}


      {inputType === "time" && (
        <Input
          type="time"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Selecione uma hora"
          disabled={isDisabled}
          style={inputStyles}
        />
      )}

      {inputType === "text" && (
        <Input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)} // Atualiza localmente ao digitar
          onBlur={handleBlur} // Chama a API ao perder o foco
          placeholder="Digite algo"
          disabled={isDisabled}
          style={inputStyles}
        />
      )}
    </div>
  );
};

export default FormInput;
