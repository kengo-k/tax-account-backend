import { SaimokuCodeConst as SC } from "@kengo-k/account-common/constant/saimoku";
import * as moment from "moment";

const getDate = (baseDate: string) => (add?: number) => {
  if (add == null) {
    add = 0;
  }
  return moment(DefaultDate, "YYYYMMDD").add(add, "days").format("YYYYMMDD");
};

// 台帳系テストに使用する年度:
//
// 台帳系の場合、累積計算のテストをする可能性があるため
// 他テストケースで意図しないデータのインサートがあるとテストがNGになるため
// 台帳系以外のテストでは、この年度を使用しないようにする
export const LedgerNendo = "2021";
export const LedgerDate = "20210401";
export const getLedgerDate = getDate(LedgerDate);

// 台帳系以外で使用する年度
export const DefaultNendo = "2020";
export const DefaultDate = "20200401";
export const getDefaultDate = getDate(DefaultDate);

// 集計系で使用する年度
export const SummaryNendo = "2019";
export const SummaryDate = "20190401";
export const getSummaryDate = getDate(SummaryDate);

export const SummaryNendo2 = "2018";
export const SummaryDate2 = "20180401";
export const getSummaryDate2 = getDate(SummaryDate2);

// 売掛金で売り上げ計上して、預金に入れるパターン
export const LedgerCdSet1 = {
  URIKAKE: SC.URIKAKE,
  SALES: SC.SALES,
  DEPOSIT: SC.DEPOSIT,
};

// 家賃と雑費を未払経費で計上し、借入金から確保した現金で支払うパターン
export const LedgerCdSet2 = {
  CASH: SC.CASH,
  DEBT: SC.DEBT,
  UNPAID_EXPENSE: SC.UNPAID_EXPENSE,
  RENT: SC.RENT,
  MISC: SC.MISC,
};
