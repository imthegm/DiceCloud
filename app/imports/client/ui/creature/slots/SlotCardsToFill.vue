<template>
  <column-layout
    wide-columns
    class="slots-to-fill"
  >
    <v-fade-transition
      group
      leave-absolute
      hide-on-leave
    >
      <div
        v-for="pointBuy in pointBuys"
        :key="pointBuy._id"
        style="transition: all 0.3s !important"
      >
        <point-buy-card
          :model="pointBuy"
          hover
          @ignore="ignoreProp(pointBuy._id)"
          @click="editPointBuy(pointBuy._id)"
        />
      </div>
      <div
        v-for="slot in slots"
        :key="slot._id"
        style="transition: all 0.3s !important"
      >
        <slot-card
          :model="slot"
          hover
          @ignore="ignoreProp(slot._id)"
          @click="fillSlot(slot._id)"
        />
      </div>
    </v-fade-transition>
  </column-layout>
</template>

<script lang="js">
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import SlotCard from '/imports/client/ui/creature/slots/SlotCard.vue';
import PointBuyCard from '/imports/client/ui/properties/components/pointBuy/PointBuyCard.vue';
import ColumnLayout from '/imports/client/ui/components/ColumnLayout.vue';
import updateCreatureProperty from '/imports/api/creature/creatureProperties/methods/updateCreatureProperty.js';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue.js';

export default {
  components: {
    SlotCard,
    PointBuyCard,
    ColumnLayout,
  },
  inject: {
    context: { default: {} }
  },
  methods: {
    ignoreProp(_id){
      updateCreatureProperty.call({
        _id,
        path: ['ignored'],
        value: true
      }, error => {
        if (error){
          console.error(error);
          snackbar({text: error.reason || error.message || error.toString()});
        }
      });
    },
    editPointBuy(_id){
      this.$store.commit('pushDialogStack', {
        component: 'creature-property-dialog',
        elementId: `point-buy-card-${_id}`,
        data: {
          _id,
          startInEditTab: true,
        },
      });
    },
  },
  meteor: {
    slots() {
      const folderIds = CreatureProperties.find({
        'ancestors.id': this.context.creatureId,
        type: 'folder',
        hideStatsGroup: true,
        removed: { $ne: true },
        inactive: { $ne: true },
      }, { fields: { _id: 1 } }).map(folder => folder._id);

      return CreatureProperties.find({
        'ancestors.id': {
          $eq: this.context.creatureId,
          $nin: folderIds,
        },
        type: 'propertySlot',
        ignored: { $ne: true },
        $and: [
          { 
            $or: [
              {'slotCondition.value': {$nin: [false, 0, '']}},
              {'slotCondition.value': {$exists: false}},
            ]
          },{
            $or: [
              { 'quantityExpected.value': {$in: [false, 0, '', undefined]} },
              { 'quantityExpected.value': {exists: false} },
              {spaceLeft: {$gt: 0}},
            ]
          },
        ],        
        removed: {$ne: true},
        inactive: {$ne: true},
      });
    },
    pointBuys(){
      return CreatureProperties.find({
        type: 'pointBuy',
        'ancestors.id': this.context.creatureId,
        ignored: { $ne: true },       
        removed: {$ne: true},
        inactive: {$ne: true},
      });
    },
  }
}
</script>

<style>
</style>
