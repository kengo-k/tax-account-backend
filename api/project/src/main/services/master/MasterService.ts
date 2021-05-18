import { inject } from "inversify";
import { TYPES } from "@core/container/types";
import { BaseService } from "@services/BaseService";
import { ConnectionProvider } from "@core/connection/ConnectionProvider";
import { SaimokuSearchRequest } from "@common/model/master/SaimokuSearchRequest";
import { SaimokuSearchResponse } from "@common/model/master/SaimokuSearchResponse";
import { selectSaimokuDetail as getSelectSaimokuDetailSql } from "@services/master/selectSaimokuDetail.sql";
import { NendoMasterEntity } from "@common/model/master/NendoMasterEntity";
import { EntitySearchCondition, Order } from "@common/model/Entity";
import { KamokuMasterEntity } from "@common/model/master/KamokuMasterEntity";
import { SaimokuMasterEntity } from "@common/model/master/SaimokuMasterEntity";

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
