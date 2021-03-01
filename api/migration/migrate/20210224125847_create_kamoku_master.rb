# 勘定科目マスタ
class CreateKamokuMaster < ActiveRecord::Migration[5.0]
  def change
    create_table :kamoku_masters do |t|
      # 科目コード
      t.string :kamoku_cd, limit: 2, null: false
      # 科目フル名称
      t.text :kamoku_full_name, null: false
      # 科目略名称(一覧表示用)
      t.text :kamoku_ryaku_name, null: false
      # 科目カナ名称(科目検索用)
      t.text :kamoku_kana_name, null: false
      # 科目分類: ("1": "資産", "2": "負債", "3": "純資産", "4": "収益", "5": "費用")
      t.string :kamoku_bunrui_cd, limit: 1, null: false
      # 科目タイプ: ("1": "借方", "2": "貸方")
      # 資産の増加/減少=借方/貸方
      # 負債の増加/減少=貸方/借方
      # 費用の増加/減少=借方/貸方
      # 収益の増加/減少=貸方/借方
      t.string :kamoku_type, limit: 1, null: false
      t.timestamps
    end
  end
end
