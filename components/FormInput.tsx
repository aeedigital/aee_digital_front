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

  useEffect(() => {
    setValue(initialValue);
    setIsEmpty(isRequired && !initialValue);
  }, [initialValue, isRequired]);

  const handleBlur = () => {
    onChange(name, value); // Dispara a alteração ao perder o foco
  };

  const handleChange = (newValue: any) => {
    setValue(newValue); // Apenas atualiza o estado local
    setIsEmpty(isRequired && !newValue);
  };

  const getInputType = () => {
    let returntype;

    switch (answerType) {
      case "Option":
        returntype = "select";
        break;
      case "String":
        returntype = "text";
        break;
      case "LongText":
        returntype = "textarea";
        break;
      case "Boolean":
        returntype = "checkbox";
        break;
      case "Radio":
        returntype = "radio";
        break;
      case "Switch":
        returntype = "switch";
        break;
      case "Date":
        returntype = "date";
        break;
      case "Time":
        returntype = "time";
        break;
      default:
        returntype = type || "text";
        break;
    }

    return returntype;
  };

  const inputType = getInputType();
  const inputStyles = isEmpty ? { borderColor: 'red', borderWidth: '1px' } : {};

  return (
    <div className="space-y-2">
      {inputType === "select" && (
         <div
         onBlur={() => {
           onChange(name, value); // Dispara a alteração ao perder o foco
         }}
       >
        <Select value={value} onValueChange={(newValue) => {
        handleChange(newValue);
      }} disabled={isDisabled}>
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
        </div>
      )}

      {inputType === "textarea" && (
        <Textarea
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur} // Dispara ao perder o foco
          placeholder="Digite algo..."
          disabled={isDisabled}
          style={inputStyles}
        />
      )}

      {inputType === "checkbox" && (
        <Checkbox
          checked={value}
          onCheckedChange={(checked) => handleChange(checked)}
          onBlur={handleBlur} // Chama ao perder o foco
          disabled={isDisabled}
        />
      )}

      {inputType === "radio" && (
        <RadioGroup
          value={value}
          onValueChange={(val) => handleChange(val)}
          onBlur={handleBlur} // Chama ao perder o foco
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
          checked={value}
          onCheckedChange={(checked) => handleChange(checked)}
          onBlur={handleBlur} // Chama ao perder o foco
          disabled={isDisabled}
        />
      )}

{inputType === "date" && (
  <Popover>
    <PopoverTrigger asChild>
      <Input
        type="text"
        value={value ? format(value, "dd/MM/yyyy") : ""}
        placeholder="Selecione uma data"
        readOnly
        onBlur={handleBlur} // Dispara ao perder o foco
        disabled={isDisabled}
        style={inputStyles}
      />
    </PopoverTrigger>
    <PopoverContent className="p-0">
      <Calendar
        selected={value}
        onSelect={(date) => {
          handleChange(date);
          onChange(name, date); // Dispara a alteração para o componente pai
        }}
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
          onBlur={handleBlur} // Dispara ao perder o foco
          placeholder="Selecione uma hora"
          disabled={isDisabled}
          style={inputStyles}
        />
      )}

      {inputType === "text" && (
        <Input
          type="text"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur} // Dispara ao perder o foco
          placeholder="Digite algo"
          disabled={isDisabled}
          style={inputStyles}
        />
      )}
    </div>
  );
};

export default FormInput;
