import React from "react";
import { Flex } from "./flex";
import { Formik, FormikConfig } from "formik";
import { Form } from "./form";
import { FormFieldTable, Field } from "./formFieldTable";
import { Button } from "./button";
import { FormikResultTable, ResultColumn } from "./resultTable";
import { GenericForm } from "~/types/form";
import * as tst from "ts-toolbelt";
import { AllOrNone, FeatureConfig, OneOf } from "~/types/utils";
import { z } from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";

export type RngToolSubmit<Values> = FormikConfig<Values>["onSubmit"];

type Props<FormState, Result> = {
  submitTrackerId: string;
  initialValues: FormState;
  onSubmit: RngToolSubmit<FormState>;
  validationSchema?: z.ZodSchema<FormState>;
  submitButtonLabel?: string;
  formContainerId?: string;
} & OneOf<{
  fields: Field[];
  getFields: (values: FormState) => Field[];
}> &
  AllOrNone<{ columns: ResultColumn<Result>[]; results: Result[] }> &
  AllOrNone<{
    rowKey: keyof Result;
    onClickResultRow?: (record: Result) => void;
  }> &
  FeatureConfig<"allowReset", { resetTrackerId: string; onReset?: () => void }>;

export const RngToolForm = <
  FormState extends GenericForm,
  Result extends tst.O.Object,
>({
  submitTrackerId,
  initialValues,
  fields,
  validationSchema,
  getFields,
  columns,
  onSubmit,
  onReset,
  onClickResultRow,
  rowKey,
  results,
  formContainerId,
  allowReset = false,
  resetTrackerId,
  submitButtonLabel = "Generate",
}: Props<FormState, Result>) => {
  const _validationSchema = React.useMemo(() => {
    return validationSchema == null
      ? null
      : toFormikValidationSchema(validationSchema);
  }, [validationSchema]);

  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      onSubmit={onSubmit}
      onReset={onReset}
      validationSchema={_validationSchema}
    >
      {(formik) => {
        const fieldsToUse = fields || getFields(formik.values);

        return (
          <Flex vertical gap={16} id={formContainerId}>
            <Form>
              <Flex vertical gap={8}>
                <FormFieldTable fields={fieldsToUse} />
                <Button trackerId={submitTrackerId} htmlType="submit">
                  {submitButtonLabel}
                </Button>
                {allowReset && resetTrackerId != null && (
                  <Button trackerId={resetTrackerId} htmlType="reset">
                    Reset
                  </Button>
                )}
              </Flex>
            </Form>

            {columns != null && (
              <FormikResultTable<Result>
                columns={columns}
                rowKey={rowKey}
                dataSource={results}
                rowSelection={
                  onClickResultRow == null
                    ? undefined
                    : {
                        type: "radio",
                        onSelect: (record) => onClickResultRow?.(record),
                      }
                }
              />
            )}
          </Flex>
        );
      }}
    </Formik>
  );
};
