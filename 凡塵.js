/*
 * Integrated Bookmarklet V1
 *
 * 1. Forge V6
 *    - 必定橙色
 *    - 已抽中的詞條數值 MAX
 *    - 3 孔
 *    - 排除 artifact
 *
 * 2. 僕從任務 V10
 *    - 打掃清潔：50,000 靈石
 *    - 餵養靈獸：500 獸丹
 *    - 種植靈草：500 靈草
 *    - 整理武學秘典：500 武學積分
 *    - 礦脈採礦：50,000 礦石
 *
 * 3. grantQuestRewards Hook
 *    - 任務真正結算時再次套用獎勵
 *
 * 4. 修煉效率 V3
 *    - 基礎修煉倍率固定 10 倍
 *    - 排除宗門倍率
 *    - 排除狐狸倍率
 *    - 排除龍倍率
 *    - 排除悟道倍率
 */

javascript:(()=>{try{

  const STATE=window.__INTEGRATED_BOOKMARKLET_V1__||{};

  const log=(...args)=>{
    try{
      console.log("[Integrated Bookmarklet]",...args);
    }catch(e){}
  };


  /* ============================================================
     1. 鍛造 V6
     ============================================================ */

  if(!STATE.forge){

    const F=window.forgeEquipment;

    if(typeof F==="function"){

      const OLD=F;
      const OLD_RANDOM=Math.random;

      const MAX={

        strPct:0.05,
        conPct:0.05,
        intPct:0.05,
        sprPct:0.05,
        chaPct:0.05,

        atkPct:0.04,
        hpPct:0.05,

        def:3,
        eva:2,

        ice:5,
        fire:5,
        poison:5,
        metal:5,
        thunder:5,

        "fx:法爆":0.05,
        "fx:手敵":0.05,
        "fx:回春":0.008,
        "fx:回靈":0.01,
        "fx:噬魂":0.02,
        "fx:聚財":0.06,
        "fx:悟道":0.03,
        "fx:積德":0.08,
        "fx:尋鐵":0.08,
        "fx:獸魂":0.08
      };


      window.__FORGE_MAX_V6_OLD__=OLD;


      window.forgeEquipment=function(qty=1){

        let first=true;


        Math.random=function(){

          /*
           * 第一次 RNG：
           * 品質判定固定回傳 0.01
           */
          if(first){

            first=false;

            return 0.01;
          }


          return OLD_RANDOM.apply(this,arguments);
        };


        const before=
          window.player &&
          player.equipInventory
            ? player.equipInventory.length
            : 0;


        let result;


        try{

          result=OLD.call(this,qty);

        }finally{

          Math.random=OLD_RANDOM;
        }


        try{

          const made=player.equipInventory.slice(before);


          made.forEach(eq=>{

            if(!eq){
              return;
            }


            /*
             * Artifact 不修改
             */
            if(eq.category==="artifact"){
              return;
            }


            /*
             * 固定橙色
             */
            eq.quality="橙色";


            /*
             * 已經抽到的詞條 → MAX
             */
            if(Array.isArray(eq.subs)){

              eq.subs.forEach(sub=>{

                if(!Array.isArray(sub)){
                  return;
                }


                const key=sub[0];


                if(
                  Object.prototype.hasOwnProperty.call(
                    MAX,
                    key
                  )
                ){

                  sub[1]=MAX[key];
                }

              });
            }


            /*
             * 三孔
             */
            eq.sockets=[
              null,
              null,
              null
            ];

          });


          /*
           * 更新畫面
           */
          try{

            if(typeof updateUI==="function"){
              updateUI();
            }

          }catch(e){}

        }catch(e){

          log(
            "Forge post-process error:",
            e
          );
        }


        return result;
      };


      STATE.forge=true;

      log(
        "Forge V6 installed"
      );

    }else{

      log(
        "forgeEquipment not found"
      );
    }
  }



  /* ============================================================
     2. 僕從任務獎勵規則
     ============================================================ */

  const applyQuestRewardRules=function(def){

    try{

      if(
        !def ||
        !def.rewards
      ){
        return;
      }


      const name=def.name;


      /*
       * 打掃清潔
       */
      if(name==="打掃清潔"){

        def.rewards.coins=50000;
      }


      /*
       * 餵養靈獸
       */
      if(name==="餵養靈獸"){

        def.rewards.beastCore=500;
      }


      /*
       * 種植靈草
       */
      if(name==="種植靈草"){

        def.rewards.spiritGrass=500;
      }


      /*
       * 整理武學秘典
       */
      if(name==="整理武學秘典"){

        def.rewards.martialPoints=500;
      }


      /*
       * 礦脈採礦
       */
      if(name==="礦脈採礦"){

        def.rewards.ore=50000;
      }

    }catch(e){

      log(
        "Quest reward rule error:",
        e
      );
    }
  };



  /* ============================================================
     3. 直接修改 questData
     ============================================================ */

  if(typeof questData!=="undefined"){

    try{

      /*
       * 打掃清潔
       */
      if(
        questData.clean &&
        questData.clean[1]
      ){

        questData.clean[1].rewards={
          coins:50000
        };
      }


      /*
       * 餵養靈獸
       */
      if(
        questData.clean &&
        questData.clean[2]
      ){

        questData.clean[2].rewards={
          beastCore:500
        };
      }


      /*
       * 種植靈草
       */
      if(questData.plant){

        [1,2,3].forEach(
          tier=>{

            if(questData.plant[tier]){

              questData.plant[tier].rewards={
                spiritGrass:500
              };

            }

          }
        );
      }


      /*
       * 整理武學秘典
       */
      if(questData.book){

        [1,2,3].forEach(
          tier=>{

            if(questData.book[tier]){

              questData.book[tier].rewards={
                martialPoints:500
              };

            }

          }
        );
      }


      /*
       * 礦脈採礦
       */
      if(questData.mine){

        [2,3].forEach(
          tier=>{

            if(questData.mine[tier]){

              questData.mine[tier].rewards={
                ore:50000
              };

            }

          }
        );
      }


      log(
        "QuestData V10 applied"
      );

    }catch(e){

      log(
        "QuestData V10 error:",
        e
      );
    }
  }



  /* ============================================================
     4. grantQuestRewards Hook
     ============================================================ */

  if(
    !STATE.questHook &&
    typeof grantQuestRewards==="function"
  ){

    const originalGrant=
      grantQuestRewards;


    const hookedGrant=
      function(def,servant){

        try{

          /*
           * 真正發放獎勵之前修改
           */
          applyQuestRewardRules(def);

        }catch(e){

          log(
            "grantQuestRewards pre-hook error:",
            e
          );
        }


        /*
         * 執行原本遊戲函式
         */
        return originalGrant.call(
          this,
          def,
          servant
        );
      };


    window.__integrated_original_grantQuestRewards__=
      originalGrant;


    window.grantQuestRewards=
      hookedGrant;


    STATE.questHook=true;


    log(
      "grantQuestRewards hook installed"
    );
  }



  /* ============================================================
     5. 更新任務 UI
     ============================================================ */

  try{

    if(
      typeof renderQuestButtons==="function"
    ){

      renderQuestButtons();
    }

  }catch(e){}


  try{

    if(
      typeof updateQuestUI==="function"
    ){

      updateQuestUI();
    }

  }catch(e){}



  /* ============================================================
     6. 修煉效率 ×10 V3
     ============================================================ */

  if(
    !STATE.cultivation &&
    typeof window.gainExp==="function"
  ){

    try{

      const original=
        window.gainExp;


      let src=
        Function.prototype.toString.call(
          original
        );


      /*
       * 嘗試解碼 URL encoded source
       */
      try{

        const decoded=
          decodeURIComponent(src);


        if(
          decoded.length>src.length ||
          decoded.includes(
            "player.sect.expMult"
          )
        ){

          src=decoded;
        }

      }catch(e){}



      /*
       * 原本：
       *
       * let finalAmount =
       * amount *
       * (player.sect
       * ? player.sect.expMult
       * : 1.0);
       */
      const oldLine=
        "let finalAmount = amount * (player.sect ? player.sect.expMult : 1.0);";


      /*
       * 修改：
       *
       * amount × 10
       */
      const newLine=
        "let finalAmount = amount * 10;";


      if(src.includes(oldLine)){

        src=
          src.replace(
            oldLine,
            newLine
          );


        /*
         * 移除狐狸倍率
         */
        src=
          src.replace(
            /\s*if\s*\(hasLiveBeast\(['"]fox['"]\)\)\s*finalAmount\s*\*=\s*1\.1;?/g,
            ""
          );


        /*
         * 移除龍倍率
         */
        src=
          src.replace(
            /\s*if\s*\(hasLiveBeast\(['"]dragon['"]\)\)\s*finalAmount\s*\*=\s*1\.2;?/g,
            ""
          );


        /*
         * 移除悟道倍率
         */
        src=
          src.replace(
            /\s*finalAmount\s*\*=\s*1\s*\+\s*gearFx\(["']悟道["']\);?/g,
            ""
          );


        /*
         * 重建 gainExp
         */
        const fn=
          Function(
            "return ("+
            src+
            ")"
          )();


        if(typeof fn==="function"){

          window.__cult10_original=
            original;


          window.gainExp=
            fn;


          STATE.cultivation=
            true;


          log(
            "Cultivation x10 installed"
          );

        }else{

          log(
            "Cultivation replacement failed"
          );
        }

      }else{

        log(
          "Original cultivation multiplier line not found"
        );
      }

    }catch(e){

      log(
        "Cultivation install error:",
        e
      );
    }
  }



  /* ============================================================
     7. 保存整合狀態
     ============================================================ */

  window.__INTEGRATED_BOOKMARKLET_V1__=
    STATE;



  /* ============================================================
     8. 顯示結果
     ============================================================ */

  const status=[

    "鍛造 V6："+(
      STATE.forge
        ?"✓ 已啟用"
        :"✗ 未找到"
    ),

    "僕從任務 V10："+(
      typeof questData!=="undefined"
        ?"✓ 已套用"
        :"✗ 未找到 questData"
    ),

    "任務發放 Hook："+(
      STATE.questHook
        ?"✓ 已啟用"
        :"✗ 未找到 grantQuestRewards"
    ),

    "修煉 10 倍："+(
      STATE.cultivation
        ?"✓ 已啟用"
        :"✗ 未安裝"
    )

  ].join("\n");


  alert(

    "✅ 整合 Bookmarklet V1 已執行\n\n"+

    status+

    "\n\n"+

    "鍛造：橙色／已抽詞條 MAX／3孔\n"+

    "任務：固定獎勵\n"+

    "修煉：基礎 10 倍"

  );


}catch(e){

  alert(

    "❌ 整合 Bookmarklet 執行失敗\n\n"+
    e.name+
    "\n"+
    e.message

  );

}})();
