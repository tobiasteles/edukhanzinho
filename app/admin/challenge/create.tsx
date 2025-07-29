import {
  Create,
  NumberInput,
  ReferenceInput,
  required,
  SelectInput,
  SimpleForm,
  TextInput,
} from "react-admin";

export const ChallengeCreate = () => {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="question" validate={[required()]} label="Questão" />
        <SelectInput
        label="Tipo da questão"
        source="type"
        choices={[
           {
            id: "SELECT",
            name: "Múltipla Escolha"
          },
          {
            id: "ASSIST",
            name: "Assistida"
          }
        ]}
        validate={[required()]}
        />
        <ReferenceInput source="lessonId" reference="lessons" label="Lição">
          <SelectInput validate={[required()]}/>
        </ReferenceInput>
        <NumberInput source="order" validate={[required()]} label="Ordem" />
      </SimpleForm>
    </Create>
  );
};
