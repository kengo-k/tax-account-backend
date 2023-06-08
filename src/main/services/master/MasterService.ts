import { ConnectionProvider } from "@core/connection/ConnectionProvider";
import { TYPES } from "@core/container/types";
import {
  EntitySearchCondition,
  Order,
} from "@kengo-k/account-common/model/Entity";
import { KamokuMasterEntity } from "@kengo-k/account-common/model/master/KamokuMasterEntity";
import { NendoMasterEntity } from "@kengo-k/account-common/model/master/NendoMasterEntity";
import { SaimokuMasterEntity } from "@kengo-k/account-common/model/master/SaimokuMasterEntity";
import { SaimokuSearchRequest } from "@kengo-k/account-common/model/master/SaimokuSearchRequest";
import { SaimokuSearchResponse } from "@kengo-k/account-common/model/master/SaimokuSearchResponse";
import { BaseService } from "@services/BaseService";
import { selectSaimokuDetail as getSelectSaimokuDetailSql } from "@services/master/selectSaimokuDetail.sql";
import { inject } from "inversify";

export class MasterService extends BaseService {
  public constructor(
    @inject(TYPES.ConnectionProvider)
    public connectionProvider: ConnectionProvider
  ) {
    super();
  }

  /**
   * 科目マスタエンティティの一覧を取得
   * @returns
   */
  public async selectKamokuList() {
    const searchCondition: EntitySearchCondition<KamokuMasterEntity> = {
      orderBy: [["kamoku_cd", Order.Asc]],
    };
    return await this.selectByEntity(KamokuMasterEntity, searchCondition);
  }

  /**
   * 細目マスタエンティティの一覧を取得
   * @returns
   */
  public async selectSaimokuList() {
    const searchCondition: EntitySearchCondition<SaimokuMasterEntity> = {
      orderBy: [["saimoku_cd", Order.Asc]],
    };
    return await this.selectByEntity(SaimokuMasterEntity, searchCondition);
  }

  /**
   * 細目の詳細情報を関連情報とともに取得する
   * @param condition 検索条件
   */
  public async selectSaimokuDetail(condition: SaimokuSearchRequest) {
    return await this.select(
      SaimokuSearchResponse,
      getSelectSaimokuDetailSql(condition)
    );
  }

  /**
   * 対象年度の一覧を取得する
   * @returns
   */
  public async selectNendoList() {
    const searchCondition: EntitySearchCondition<NendoMasterEntity> = {
      orderBy: [["nendo", Order.Desc]],
    };
    return await this.selectByEntity(NendoMasterEntity, searchCondition);
  }
}
